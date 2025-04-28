import mongoose from 'mongoose'

// 定义食谱营养信息接口
interface INutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar?: number
  fiber?: number
}

// 定义食谱接口
export interface IRecipe extends mongoose.Document {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  prepTime: number // 准备时间（分钟）
  cookTime: number // 烹饪时间（分钟）
  servings: number // 份量
  difficulty: 'easy' | 'medium' | 'hard' // 难度
  cuisine: string // 菜系，例如：中式、西式、日式等
  category: string[] // 分类，例如：主食、甜点、小吃等
  tags: string[] // 标签，例如：素食、低脂、快手菜等
  image: string // 图片链接
  nutrition: INutrition // 营养信息
  author: mongoose.Schema.Types.ObjectId // 作者ID
  favorites: mongoose.Schema.Types.ObjectId[] // 收藏用户ID列表
  createdAt: Date
  updatedAt: Date
  isFavorite?: boolean // 当前用户是否收藏
}

// 食谱Schema定义
const recipeSchema = new mongoose.Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, '食谱标题是必填的'],
      trim: true,
      minlength: [2, '标题至少需要2个字符'],
      maxlength: [100, '标题不能超过100个字符'],
    },
    description: {
      type: String,
      required: [true, '食谱描述是必填的'],
      trim: true,
      maxlength: [1000, '描述不能超过1000个字符'],
    },
    ingredients: {
      type: [String],
      required: [true, '食材列表是必填的'],
      validate: [(v: string[]) => v.length > 0, '至少需要一项食材'],
    },
    steps: {
      type: [String],
      required: [true, '烹饪步骤是必填的'],
      validate: [(v: string[]) => v.length > 0, '至少需要一个烹饪步骤'],
    },
    prepTime: {
      type: Number,
      required: [true, '准备时间是必填的'],
      min: [0, '准备时间不能为负数'],
    },
    cookTime: {
      type: Number,
      required: [true, '烹饪时间是必填的'],
      min: [0, '烹饪时间不能为负数'],
    },
    servings: {
      type: Number,
      required: [true, '份量是必填的'],
      min: [1, '份量至少为1'],
    },
    difficulty: {
      type: String,
      required: [true, '难度是必填的'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '难度必须是：easy, medium, hard之一',
      },
    },
    cuisine: {
      type: String,
      required: [true, '菜系是必填的'],
      trim: true,
    },
    category: {
      type: [String],
      required: [true, '分类是必填的'],
      validate: [(v: string[]) => v.length > 0, '至少需要一个分类'],
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: 'https://source.unsplash.com/random/800x600/?food',
    },
    nutrition: {
      calories: {
        type: Number,
        required: [true, '卡路里是必填的'],
        min: [0, '卡路里不能为负数'],
      },
      protein: {
        type: Number,
        required: [true, '蛋白质含量是必填的'],
        min: [0, '蛋白质含量不能为负数'],
      },
      carbs: {
        type: Number,
        required: [true, '碳水化合物含量是必填的'],
        min: [0, '碳水化合物含量不能为负数'],
      },
      fat: {
        type: Number,
        required: [true, '脂肪含量是必填的'],
        min: [0, '脂肪含量不能为负数'],
      },
      sugar: {
        type: Number,
        min: [0, '糖分含量不能为负数'],
        default: 0,
      },
      fiber: {
        type: Number,
        min: [0, '纤维含量不能为负数'],
        default: 0,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '作者ID是必填的'],
    },
    favorites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // 更新时自动更新updatedAt字段
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// 索引定义，用于提高查询性能
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' })
recipeSchema.index({ author: 1 })
recipeSchema.index({ favorites: 1 })
recipeSchema.index({ category: 1 })
recipeSchema.index({ cuisine: 1 })
recipeSchema.index({ difficulty: 1 })

// 虚拟属性：总烹饪时间
recipeSchema.virtual('totalTime').get(function (this: IRecipe) {
  return this.prepTime + this.cookTime
})

// 虚拟属性：收藏数量
recipeSchema.virtual('favoriteCount').get(function (this: IRecipe) {
  return this.favorites.length
})

// 创建Recipe模型
const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema)

export default Recipe
