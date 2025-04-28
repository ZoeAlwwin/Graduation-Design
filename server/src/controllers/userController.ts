import { Request, Response } from 'express'
import User, { IUser } from '../models/User'
import { generateToken } from '../utils/token'
import { catchAsync } from '../utils/errorHandler'

/**
 * 用户注册
 * POST /api/users/register
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const { username, email, password } = req.body

  // 检查用户名是否已存在
  const existingUsername = await User.findOne({ username })
  if (existingUsername) {
    return res.status(400).json({ message: '该用户名已被使用' })
  }

  // 检查邮箱是否已存在
  const existingEmail = await User.findOne({ email })
  if (existingEmail) {
    return res.status(400).json({ message: '该邮箱已被注册' })
  }

  // 创建新用户
  const user = await User.create({
    username,
    email,
    password,
    avatar: `https://source.unsplash.com/random/100x100/?portrait&${Date.now()}`,
    bio: '',
  })

  // 生成JWT令牌
  const token = generateToken(user)

  // 返回用户信息和令牌
  res.status(201).json({
    message: '用户注册成功',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    },
    token,
  })
})

/**
 * 用户登录
 * POST /api/users/login
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const { username, password } = req.body

  // 检查用户名和密码是否提供
  if (!username || !password) {
    return res.status(400).json({ message: '请提供用户名和密码' })
  }

  // 查找用户并选择密码字段（因为默认查询会排除密码）
  const user = await User.findOne({ username }).select('+password')

  // 检查用户是否存在
  if (!user) {
    return res.status(401).json({ message: '用户名或密码不正确' })
  }

  // 检查密码是否匹配
  const isPasswordMatch = await user.comparePassword(password)
  if (!isPasswordMatch) {
    return res.status(401).json({ message: '用户名或密码不正确' })
  }

  // 生成JWT令牌
  const token = generateToken(user)

  // 返回用户信息和令牌
  res.status(200).json({
    message: '登录成功',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    },
    token,
  })
})

/**
 * 获取当前用户信息
 * GET /api/users/me
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  // 获取请求中的用户信息（由auth中间件设置）
  const user = req.user as IUser

  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  })
})

/**
 * 更新用户资料
 * PUT /api/users/profile
 */
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { username, email, bio, avatar } = req.body
  const userId = req.userId

  // 如果用户名被更改，检查它是否已被其他用户使用
  if (username) {
    const existingUser = await User.findOne({ username, _id: { $ne: userId } })
    if (existingUser) {
      return res.status(400).json({ message: '该用户名已被使用' })
    }
  }

  // 如果邮箱被更改，检查它是否已被其他用户使用
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } })
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' })
    }
  }

  // 更新用户信息
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { username, email, bio, avatar },
    { new: true, runValidators: true },
  )

  if (!updatedUser) {
    return res.status(404).json({ message: '未找到用户' })
  }

  res.status(200).json({
    message: '个人资料已成功更新',
    user: {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
    },
  })
})

/**
 * 更改密码
 * PUT /api/users/change-password
 */
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.userId

  // 获取用户并包含密码字段
  const user = await User.findById(userId).select('+password')

  if (!user) {
    return res.status(404).json({ message: '未找到用户' })
  }

  // 检查当前密码是否正确
  const isPasswordCorrect = await user.comparePassword(currentPassword)
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: '当前密码不正确' })
  }

  // 更新密码
  user.password = newPassword
  await user.save()

  res.status(200).json({ message: '密码已成功更改' })
})

/**
 * 获取用户创建的食谱
 * GET /api/users/recipes
 */
export const getUserRecipes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.userId

  const user = await User.findById(userId).populate({
    path: 'recipes',
    select: 'title description image createdAt updatedAt',
  })

  if (!user) {
    return res.status(404).json({ message: '未找到用户' })
  }

  res.status(200).json({
    recipes: user.recipes,
  })
})

/**
 * 获取用户收藏的食谱
 * GET /api/users/favorites
 */
export const getUserFavorites = catchAsync(async (req: Request, res: Response) => {
  const userId = req.userId

  const user = await User.findById(userId).populate({
    path: 'favoriteRecipes',
    select: 'title description image createdAt updatedAt',
  })

  if (!user) {
    return res.status(404).json({ message: '未找到用户' })
  }

  res.status(200).json({
    recipes: user.favoriteRecipes,
  })
})
