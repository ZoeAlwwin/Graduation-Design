/**
 * 食谱相关类型定义
 * 包含食谱、食材、烹饪步骤、营养信息等数据结构的类型定义
 */

export interface Ingredient {
  id: string
  name: string
  amount: string
  unit: string
}

export interface CookingStep {
  id: string
  description: string
  imageUrl?: string
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  omega3?: number
}

export interface Recipe {
  id: string
  title: string
  description: string
  image: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string[]
  cuisine: string
  tags: string[]
  ingredients: string[]
  steps: string[]
  nutrition?: NutritionInfo
  author: {
    id: string
    username: string
    avatar?: string
  }
  favorites: string[]
  createdAt: Date
  updatedAt: Date
  isFavorite: boolean
  favoriteCount: number
}

export interface RecipeFilter {
  search?: string
  category?: string
  tags?: string[]
  difficulty?: string
  maxPrepTime?: number
  maxCookTime?: number
  ingredients?: string[]
  page?: number
  limit?: number
}
