/**
 * 食谱推荐引擎
 * 基于机器学习方法实现个性化食谱推荐
 * 包含内容协同过滤(Content-Based Filtering)和相似度计算算法
 */
import type { Recipe } from '@/types/recipe'

/**
 * 特征权重 - 用于调整不同特征在相似度计算中的重要性
 */
const FEATURE_WEIGHTS = {
  category: 0.35, // 分类相似度权重
  tags: 0.25, // 标签相似度权重
  ingredients: 0.2, // 食材相似度权重
  difficulty: 0.1, // 难度相似度权重
  cookTime: 0.1, // 烹饪时间相似度权重
}

/**
 * 计算两个食谱的相似度分数
 * 使用加权Jaccard相似度算法
 * @param recipe1 参考食谱
 * @param recipe2 候选食谱
 * @returns 相似度分数 (0-1之间，1表示完全相似)
 */
export function calculateSimilarity(recipe1: Recipe, recipe2: Recipe): number {
  // 计算分类相似度 (Jaccard相似系数)
  const categoryScore = calculateJaccardSimilarity(
    Array.isArray(recipe1.category) ? recipe1.category : [recipe1.category],
    Array.isArray(recipe2.category) ? recipe2.category : [recipe2.category],
  )

  // 计算标签相似度
  const tagScore = calculateJaccardSimilarity(recipe1.tags, recipe2.tags)

  // 计算食材相似度
  const ingredientNames1 = extractIngredientNames(recipe1.ingredients)
  const ingredientNames2 = extractIngredientNames(recipe2.ingredients)
  const ingredientScore = calculateJaccardSimilarity(ingredientNames1, ingredientNames2)

  // 计算难度相似度 (相同难度为1，否则为0)
  const difficultyScore = recipe1.difficulty === recipe2.difficulty ? 1 : 0

  // 计算烹饪时间相似度 (基于时间差异的归一化分数)
  const cookTimeScore = 1 - Math.min(1, Math.abs(recipe1.cookTime - recipe2.cookTime) / 60)

  // 计算加权总分
  const weightedScore =
    categoryScore * FEATURE_WEIGHTS.category +
    tagScore * FEATURE_WEIGHTS.tags +
    ingredientScore * FEATURE_WEIGHTS.ingredients +
    difficultyScore * FEATURE_WEIGHTS.difficulty +
    cookTimeScore * FEATURE_WEIGHTS.cookTime

  return weightedScore
}

/**
 * 计算Jaccard相似系数
 * @param set1 集合1
 * @param set2 集合2
 * @returns 相似度分数 (0-1)
 */
function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  // 创建集合以确保元素唯一性
  const set1Elements = new Set(set1)
  const set2Elements = new Set(set2)

  // 如果两个集合都为空，返回0
  if (set1Elements.size === 0 && set2Elements.size === 0) return 0

  // 计算交集大小
  const intersection = new Set([...set1Elements].filter((item) => set2Elements.has(item)))

  // 计算并集大小
  const union = new Set([...set1Elements, ...set2Elements])

  // 返回 Jaccard 相似系数 = 交集大小 / 并集大小
  return intersection.size / union.size
}

/**
 * 从食材对象数组中提取食材名称
 * @param ingredients 食材数组
 * @returns 食材名称数组
 */
function extractIngredientNames(
  ingredients: (string | { name: string; amount?: string })[],
): string[] {
  // 处理两种可能的数据结构
  // 1. 字符串数组 ["鸡蛋", "面粉"]
  // 2. 对象数组 [{name: "鸡蛋", amount: "2个"}, {name: "面粉", amount: "500g"}]
  return ingredients
    .map((ingredient) => {
      if (typeof ingredient === 'string') {
        return ingredient.toLowerCase()
      } else if (typeof ingredient === 'object' && ingredient.name) {
        return ingredient.name.toLowerCase()
      }
      return ''
    })
    .filter(Boolean)
}

/**
 * 获取当前食谱的相关推荐食谱
 * @param currentRecipe 当前正在查看的食谱
 * @param allRecipes 所有可用的食谱
 * @param limit 返回的推荐食谱数量
 * @returns 推荐食谱数组，按相似度排序
 */
export function getRecommendedRecipes(
  currentRecipe: Recipe,
  allRecipes: Recipe[],
  limit: number = 3,
): Recipe[] {
  // 过滤掉当前食谱
  const candidates = allRecipes.filter((recipe) => recipe.id !== currentRecipe.id)

  // 计算每个候选食谱与当前食谱的相似度
  const scoredCandidates = candidates.map((recipe) => ({
    recipe,
    similarityScore: calculateSimilarity(currentRecipe, recipe),
  }))

  // 按相似度降序排序
  scoredCandidates.sort((a, b) => b.similarityScore - a.similarityScore)

  // 返回相似度最高的前N个食谱
  return scoredCandidates.slice(0, limit).map((item) => item.recipe)
}

/**
 * 使用分类权重为用户提供个性化推荐
 * @param userViewHistory 用户查看的食谱历史
 * @param allRecipes 所有可用的食谱
 * @param limit 返回的推荐数量
 * @returns 推荐食谱数组
 */
export function getPersonalizedRecommendations(
  userViewHistory: Recipe[],
  allRecipes: Recipe[],
  limit: number = 3,
): Recipe[] {
  // 如果用户没有浏览历史，返回随机推荐
  if (!userViewHistory.length) {
    return getRandomRecipes(allRecipes, limit)
  }

  // 收集用户兴趣偏好
  const categoryPreferences = new Map<string, number>()
  const tagPreferences = new Map<string, number>()

  // 分析用户历史，构建偏好模型
  userViewHistory.forEach((recipe) => {
    // 处理分类偏好
    if (Array.isArray(recipe.category)) {
      recipe.category.forEach((category) => {
        categoryPreferences.set(category, (categoryPreferences.get(category) || 0) + 1)
      })
    }

    // 处理标签偏好
    recipe.tags.forEach((tag) => {
      tagPreferences.set(tag, (tagPreferences.get(tag) || 0) + 1)
    })
  })

  // 构建候选食谱列表，排除用户已浏览过的
  const viewedIds = new Set(userViewHistory.map((r) => r.id))
  const candidates = allRecipes.filter((recipe) => !viewedIds.has(recipe.id))

  // 为每个候选食谱计算兴趣分数
  const scoredCandidates = candidates.map((recipe) => {
    let interestScore = 0

    // 计算分类兴趣得分
    const recipeCategories = Array.isArray(recipe.category) ? recipe.category : [recipe.category]
    recipeCategories.forEach((category) => {
      if (categoryPreferences.has(category)) {
        interestScore += (categoryPreferences.get(category) || 0) * FEATURE_WEIGHTS.category
      }
    })

    // 计算标签兴趣得分
    recipe.tags.forEach((tag) => {
      if (tagPreferences.has(tag)) {
        interestScore += (tagPreferences.get(tag) || 0) * FEATURE_WEIGHTS.tags
      }
    })

    return { recipe, interestScore }
  })

  // 按兴趣分数排序
  scoredCandidates.sort((a, b) => b.interestScore - a.interestScore)

  // 返回得分最高的前N个食谱
  return scoredCandidates.slice(0, limit).map((item) => item.recipe)
}

/**
 * 获取随机食谱推荐
 * @param allRecipes 所有可用的食谱
 * @param limit 返回的推荐数量
 * @returns 随机食谱数组
 */
function getRandomRecipes(allRecipes: Recipe[], limit: number): Recipe[] {
  const shuffled = [...allRecipes].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, limit)
}
