/**
 * 食谱管理模块
 * 使用Pinia管理食谱数据，包括CRUD操作和过滤功能
 * 通过API与后端通信，持久化存储食谱数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recipeApi } from '@/services/api'
import type { Recipe, RecipeFilter } from '@/types/recipe'
import { useUserStore } from './user'

// 定义搜索参数类型
interface SearchParams {
  title?: string
  category?: string[]
  tags?: string[]
  cuisine?: string
  difficulty?: string
  author?: string
  favorites?: boolean
  page?: number
  limit?: number
  [key: string]: unknown
}

// 定义API错误类型
interface ApiError {
  message?: string
  status?: number
  [key: string]: unknown
}

// 定义API响应类型
interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    totalPages: number
    total: number
  }
}

export const useRecipeStore = defineStore('recipe', () => {
  // 状态
  const recipes = ref<Recipe[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalRecipes = ref(0)
  const currentRecipe = ref<Recipe | null>(null)

  // 用户存储
  const userStore = useUserStore()

  // 计算属性
  const popularCategories = computed(() => {
    const categoryCounts: Record<string, number> = {}
    recipes.value.forEach((recipe) => {
      if (Array.isArray(recipe.category)) {
        recipe.category.forEach((cat: string) => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
        })
      }
    })

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category)
  })

  const popularTags = computed(() => {
    const tagCounts: Record<string, number> = {}
    recipes.value.forEach((recipe) => {
      recipe.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag)
  })

  // 获取所有分类
  const categories = computed(() => {
    const categorySet = new Set<string>()
    recipes.value.forEach((recipe) => {
      if (Array.isArray(recipe.category)) {
        recipe.category.forEach((cat: string) => {
          categorySet.add(cat)
        })
      }
    })
    return Array.from(categorySet)
  })

  // 根据筛选条件过滤食谱
  const getFilteredRecipes = (filter: {
    search?: string
    category?: string
    tags?: string[]
    difficulty?: string
    maxPrepTime?: number
    maxCookTime?: number
    ingredients?: string[]
  }) => {
    return recipes.value.filter((recipe) => {
      // 搜索标题和描述
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        if (
          !recipe.title.toLowerCase().includes(searchLower) &&
          !recipe.description.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // 分类筛选
      if (filter.category && recipe.category) {
        if (!recipe.category.includes(filter.category)) {
          return false
        }
      }

      // 标签筛选
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.every((tag) => recipe.tags.includes(tag))) {
          return false
        }
      }

      // 难度筛选
      if (filter.difficulty && recipe.difficulty !== filter.difficulty) {
        return false
      }

      // 准备时间筛选
      if (filter.maxPrepTime && recipe.prepTime > filter.maxPrepTime) {
        return false
      }

      // 烹饪时间筛选
      if (filter.maxCookTime && recipe.cookTime > filter.maxCookTime) {
        return false
      }

      // 食材筛选
      if (filter.ingredients && filter.ingredients.length > 0) {
        if (
          !filter.ingredients.every((ingredient) =>
            recipe.ingredients.some((item) =>
              item.name.toLowerCase().includes(ingredient.toLowerCase()),
            ),
          )
        ) {
          return false
        }
      }

      return true
    })
  }

  // 初始化食谱数据
  const initialize = async () => {
    if (recipes.value.length > 0) return

    await fetchAllRecipes()
  }

  // 获取所有食谱
  const fetchAllRecipes = async (filter?: RecipeFilter) => {
    isLoading.value = true
    error.value = ''

    try {
      // 转换 filter 为 API 参数格式
      const apiParams = filter
        ? {
            ...filter,
            category: filter.category ? [filter.category] : undefined,
            page: filter.page || 1,
            limit: filter.limit || 12,
          }
        : {
            page: 1,
            limit: 12,
          }

      const response = await recipeApi.getAllRecipes(apiParams)
      const { data, pagination } = response as ApiResponse<Recipe[]>

      // 更新分页信息
      if (pagination) {
        currentPage.value = pagination.page
        totalPages.value = pagination.totalPages
        totalRecipes.value = pagination.total
      }

      // 直接使用服务器返回的数据
      recipes.value = data

      return data
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error('获取食谱列表失败:', apiError)
      error.value = apiError.message || '获取食谱列表失败，请稍后重试'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 根据ID获取单个食谱
  const getRecipeById = async (id: string): Promise<Recipe | null> => {
    // 验证 ID
    if (!id || id === 'undefined') {
      console.error('无效的食谱ID')
      return null
    }

    // 先从本地缓存查找
    const cachedRecipe = recipes.value.find((r) => r.id === id)
    if (cachedRecipe) {
      return cachedRecipe
    }

    // 如果本地没有，从API获取
    isLoading.value = true
    error.value = ''

    try {
      const response = await recipeApi.getRecipe(id)
      const recipe = response.data

      // 添加到本地缓存
      const existingIndex = recipes.value.findIndex((r) => r.id === recipe.id)
      if (existingIndex === -1) {
        recipes.value.push(recipe)
      } else {
        recipes.value[existingIndex] = recipe
      }

      return recipe
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error(`获取食谱 ${id} 失败:`, apiError)
      error.value = apiError.message || '获取食谱失败，请稍后重试'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 添加新食谱
  const addRecipe = async (recipe: Partial<Recipe>): Promise<Recipe | null> => {
    isLoading.value = true
    error.value = ''

    try {
      const response = await recipeApi.createRecipe(recipe)
      const newRecipe = response.data

      // 添加到本地缓存
      recipes.value.unshift(newRecipe)

      return newRecipe
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error('添加食谱失败:', apiError)
      error.value = apiError.message || '添加食谱失败，请稍后重试'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 更新食谱
  const updateRecipe = async (id: string, data: Partial<Recipe>): Promise<Recipe | null> => {
    isLoading.value = true
    error.value = ''

    try {
      const response = await recipeApi.updateRecipe(id, data)
      const updatedRecipe = response.data

      // 更新本地缓存
      const index = recipes.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        recipes.value[index] = updatedRecipe
      }

      return updatedRecipe
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error(`更新食谱 ${id} 失败:`, apiError)
      error.value = apiError.message || '更新食谱失败，请稍后重试'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 删除食谱
  const deleteRecipe = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = ''

    try {
      await recipeApi.deleteRecipe(id)

      // 从本地缓存中删除
      recipes.value = recipes.value.filter((r) => r.id !== id)

      return true
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error(`删除食谱 ${id} 失败:`, apiError)
      error.value = apiError.message || '删除食谱失败，请稍后重试'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 获取用户创建的食谱
  const fetchUserRecipes = async (userId: string) => {
    isLoading.value = true
    error.value = ''

    try {
      const response = await recipeApi.getUserRecipes(userId)
      const { data } = response as ApiResponse<Recipe[]>

      // 更新食谱列表，保留收藏状态
      const existingFavorites = new Set(recipes.value.map((r) => r.id))
      recipes.value = data.map((recipe) => ({
        ...recipe,
        isFavorite: existingFavorites.has(recipe.id),
      }))

      return data
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error('获取用户食谱失败:', apiError)
      error.value = apiError.message || '获取用户食谱失败，请稍后重试'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 获取用户收藏的食谱
  const fetchFavoriteRecipes = async () => {
    isLoading.value = true
    error.value = ''

    try {
      const response = await recipeApi.getFavoriteRecipes()
      const { data } = response as ApiResponse<Recipe[]>

      // 更新食谱列表，设置收藏状态
      recipes.value = data.map((recipe) => ({
        ...recipe,
        isFavorite: true,
        favorites: [userStore.currentUser?.id].filter(Boolean) as string[],
      }))

      return data
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error('获取收藏食谱失败:', apiError)
      error.value = apiError.message || '获取收藏食谱失败，请稍后重试'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // 检查食谱是否被当前用户收藏
  const isRecipeFavorited = (recipeId: string): boolean => {
    if (!userStore.currentUser) return false
    return recipes.value.some(
      (recipe) => recipe.id === recipeId && recipe.favorites?.includes(userStore.currentUser!.id),
    )
  }

  // 切换收藏状态
  const toggleFavorite = async (id: string): Promise<void> => {
    try {
      const response = await recipeApi.toggleFavorite(id)
      const updatedRecipe = response.data

      // 更新本地缓存中的食谱
      const index = recipes.value.findIndex((r) => r.id === id)
      if (index !== -1) {
        recipes.value[index] = updatedRecipe
      }

      // 如果当前正在查看这个食谱，更新它的状态
      if (currentRecipe.value?.id === id) {
        currentRecipe.value = updatedRecipe
      }
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error('切换收藏状态失败:', apiError)
      error.value = apiError.message || '切换收藏状态失败，请稍后重试'
      throw apiError
    }
  }

  // 搜索食谱
  const searchRecipes = async (params: Partial<SearchParams>) => {
    await fetchAllRecipes(params)
  }

  // 重置 store 状态
  const resetStore = () => {
    recipes.value = []
    currentPage.value = 1
    totalPages.value = 1
    totalRecipes.value = 0
    error.value = ''
    isLoading.value = false
    currentRecipe.value = null
  }

  return {
    // 状态
    recipes,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalRecipes,
    currentRecipe,

    // 计算属性
    popularCategories,
    popularTags,
    categories,

    // 方法
    initialize,
    fetchAllRecipes,
    getRecipeById,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    fetchUserRecipes,
    fetchFavoriteRecipes,
    isRecipeFavorited,
    toggleFavorite,
    searchRecipes,
    getFilteredRecipes,
    resetStore,
  }
})
