import { Request, Response } from 'express'
import Recipe from '../models/Recipe'
import User from '../models/User'
import { catchAsync } from '../utils/errorHandler'
import mongoose from 'mongoose'

/**
 * 获取所有食谱
 * GET /api/recipes
 */
export const getAllRecipes = catchAsync(async (req: Request, res: Response) => {
  // 构建查询条件
  const queryObj: Record<string, unknown> = {}

  // 获取查询参数
  const { title, category, cuisine, difficulty, author, favorites, tags } = req.query

  // 标题搜索（使用模糊匹配）
  if (title) {
    queryObj.title = { $regex: title, $options: 'i' }
  }

  // 按类别过滤
  if (category) {
    queryObj.category = { $in: Array.isArray(category) ? category : [category] }
  }

  // 按菜系过滤
  if (cuisine) {
    queryObj.cuisine = cuisine
  }

  // 按难度过滤
  if (difficulty) {
    queryObj.difficulty = difficulty
  }

  // 按作者过滤
  if (author) {
    queryObj.author = author
  }

  // 按收藏者过滤
  if (favorites && req.userId) {
    queryObj.favorites = req.userId
  }

  // 按标签过滤
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags]
    queryObj.tags = { $in: tagArray }
  }

  // 分页
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  // 构建查询
  const query = Recipe.find(queryObj)
    .populate('author', 'username avatar')
    .select('+ingredients +steps') // 确保返回 ingredients 和 steps 字段
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })

  // 执行查询
  const [recipes, total] = await Promise.all([query.exec(), Recipe.countDocuments(queryObj)])

  // 如果是当前用户，添加收藏状态
  if (req.userId) {
    recipes.forEach((recipe) => {
      const recipeObj = recipe.toObject()
      recipeObj.isFavorite = recipe.favorites.some((id) => id.toString() === req.userId)
      Object.assign(recipe, recipeObj)
    })
  }

  // 返回结果
  res.status(200).json({
    status: 'success',
    results: recipes.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: recipes,
  })
})

/**
 * 获取单个食谱
 * GET /api/recipes/:id
 */
export const getRecipe = catchAsync(async (req: Request, res: Response) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('author', 'username avatar')
    .select('+ingredients +steps') // 确保返回 ingredients 和 steps 字段

  if (!recipe) {
    return res.status(404).json({ message: '未找到该食谱' })
  }

  // 如果是当前用户，添加收藏状态
  if (req.userId) {
    const recipeObj = recipe.toObject()
    recipeObj.isFavorite = recipe.favorites.some((id) => id.toString() === req.userId)
    return res.status(200).json({
      status: 'success',
      data: recipeObj,
    })
  }

  res.status(200).json({
    status: 'success',
    data: recipe,
  })
})

/**
 * 创建新食谱
 * POST /api/recipes
 */
export const createRecipe = catchAsync(async (req: Request, res: Response) => {
  // 确保当前用户为作者
  req.body.author = req.userId

  // 创建新食谱
  const newRecipe = await Recipe.create(req.body)

  res.status(201).json({
    status: 'success',
    message: '食谱创建成功',
    data: newRecipe,
  })
})

/**
 * 更新食谱
 * PUT /api/recipes/:id
 */
export const updateRecipe = catchAsync(async (req: Request, res: Response) => {
  // 查找食谱
  const recipe = await Recipe.findById(req.params.id)

  if (!recipe) {
    return res.status(404).json({ message: '未找到该食谱' })
  }

  // 检查操作者是否为食谱作者
  if (recipe.author.toString() !== req.userId) {
    return res.status(403).json({ message: '您没有权限修改此食谱' })
  }

  // 更新食谱，但不允许更改作者
  delete req.body.author

  const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('author', 'username avatar')

  res.status(200).json({
    status: 'success',
    message: '食谱更新成功',
    data: updatedRecipe,
  })
})

/**
 * 删除食谱
 * DELETE /api/recipes/:id
 */
export const deleteRecipe = catchAsync(async (req: Request, res: Response) => {
  // 查找食谱和用户
  const recipe = await Recipe.findById(req.params.id)
  if (!recipe) {
    return res.status(404).json({ message: '未找到该食谱' })
  }

  // 检查操作者是否为食谱作者
  if (recipe.author.toString() !== req.userId) {
    return res.status(403).json({ message: '您没有权限删除此食谱' })
  }

  // 查找作者用户
  const user = await User.findById(req.userId)
  if (!user) {
    return res.status(404).json({ message: '未找到该用户' })
  }

  // 从用户的食谱列表中移除
  user.recipes = user.recipes.filter((id) => id.toString() !== recipe.id)

  // 并行执行删除食谱和更新用户
  await Promise.all([Recipe.findByIdAndDelete(req.params.id), user.save()])

  res.status(200).json({
    status: 'success',
    message: '食谱已成功删除',
  })
})

/**
 * 获取用户创建的食谱
 * GET /api/recipes/user/:userId
 */
export const getUserRecipes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId

  // 分页
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  // 构建查询
  const query = Recipe.find({ author: userId })
    .populate('author', 'username avatar')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })

  // 执行查询
  const [recipes, total] = await Promise.all([
    query.exec(),
    Recipe.countDocuments({ author: userId }),
  ])

  // 返回结果
  res.status(200).json({
    status: 'success',
    results: recipes.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: recipes,
  })
})

/**
 * 获取用户收藏的食谱
 * GET /api/recipes/favorites
 */
export const getFavoriteRecipes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: '未登录' })
  }

  // 分页
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  // 构建查询
  const query = Recipe.find({ favorites: userId })
    .populate('author', 'username avatar')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })

  // 执行查询
  const [recipes, total] = await Promise.all([
    query.exec(),
    Recipe.countDocuments({ favorites: userId }),
  ])

  // 返回结果
  res.status(200).json({
    status: 'success',
    results: recipes.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: recipes,
  })
})

/**
 * 切换食谱收藏状态
 * POST /api/recipes/:id/favorite
 */
export const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
  const recipeId = req.params.id
  const userId = req.userId
  if (!userId) {
    return res.status(401).json({ message: '未登录' })
  }

  // 查找食谱和用户
  const [recipe, user] = await Promise.all([Recipe.findById(recipeId), User.findById(userId)])

  if (!recipe) {
    return res.status(404).json({ message: '未找到该食谱' })
  }

  if (!user) {
    return res.status(404).json({ message: '未找到该用户' })
  }

  // 检查是否已收藏
  const userObjectId = new mongoose.Types.ObjectId(userId)
  const isFavorited = recipe.favorites.some((id) => id.toString() === userObjectId.toString())

  // 更新收藏状态
  if (isFavorited) {
    // 从食谱中移除收藏
    recipe.favorites = recipe.favorites.filter((id) => id.toString() !== userObjectId.toString())
    // 从用户的收藏列表中移除
    user.favoriteRecipes = user.favoriteRecipes.filter((id) => id.toString() !== recipeId)
  } else {
    // 添加到食谱的收藏列表
    // @ts-expect-error - 我们知道这个类型转换是安全的
    recipe.favorites.push(userObjectId)
    // 添加到用户的收藏列表
    // @ts-expect-error - 我们知道这个类型转换是安全的
    user.favoriteRecipes.push(new mongoose.Types.ObjectId(recipeId))
  }

  // 保存更改
  await Promise.all([recipe.save(), user.save()])

  // 返回更新后的食谱
  res.status(200).json({
    status: 'success',
    data: recipe,
  })
})
