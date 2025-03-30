import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// 用户接口定义
export interface IUser extends mongoose.Document {
  username: string
  email: string
  password: string
  avatar: string
  bio?: string
  createdAt: Date
  recipes: mongoose.Schema.Types.ObjectId[] // 用户创建的食谱
  favoriteRecipes: mongoose.Schema.Types.ObjectId[] // 用户收藏的食谱
  comparePassword(candidatePassword: string): Promise<boolean>
}

// 用户Schema定义
const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '用户名是必填的'],
      unique: true,
      trim: true,
      minlength: [3, '用户名至少需要3个字符'],
    },
    email: {
      type: String,
      required: [true, '邮箱是必填的'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '请提供有效的邮箱地址'],
    },
    password: {
      type: String,
      required: [true, '密码是必填的'],
      minlength: [6, '密码至少需要6个字符'],
      select: false, // 默认查询不返回密码
    },
    avatar: {
      type: String,
      default: 'https://source.unsplash.com/random/100x100/?portrait',
    },
    bio: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        default: [],
      },
    ],
    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        default: [],
      },
    ],
  },
  {
    // 转换为JSON时的选项
    toJSON: {
      transform: (_, ret) => {
        delete ret.password // 确保密码不会被输出
        delete ret.__v // 删除版本号
        return ret
      },
    },
  },
)

// 保存前的密码哈希处理
userSchema.pre('save', async function (next) {
  // 只有在密码被修改时才重新加密
  if (!this.isModified('password')) return next()

  try {
    // 生成盐
    const salt = await bcrypt.genSalt(10)
    // 哈希密码
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// 比较密码的方法
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// 创建用户模型
const User = mongoose.model<IUser>('User', userSchema)

export default User
