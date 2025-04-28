/**
 * API 服务模块
 * 统一处理前端与后端API的通信
 */
import axios from 'axios'
import type { Recipe } from '@/types/recipe'
import type { User, LoginCredentials, RegisterData } from '@/stores/user'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：自动添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || '服务器错误，请稍后重试'
    console.error('API错误:', message)
    return Promise.reject(message)
  },
)

// 用户相关API
export const userApi = {
  // 用户注册
  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/users/register', data)
      // 保存token到本地存储
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      return {
        user: response.data.user,
        token: response.data.token,
      }
    } catch (error) {
      throw error
    }
  },

  // 用户登录
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post('/users/login', credentials)
      // 保存token到本地存储
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      return {
        user: response.data.user,
        token: response.data.token,
      }
    } catch (error) {
      throw error
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get('/users/me')
      return {
        user: response.data.user,
      }
    } catch (error) {
      throw error
    }
  },

  // 更新用户资料
  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    try {
      const response = await api.put('/users/profile', data)
      return {
        user: response.data.user,
      }
    } catch (error) {
      throw error
    }
  },

  // 更改密码
  changePassword: async (data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> => {
    try {
      const response = await api.put('/users/change-password', data)
      return {
        message: response.data.message,
      }
    } catch (error) {
      throw error
    }
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token')
  },
}

// 食谱相关API
export const recipeApi = {
  // 获取所有食谱
  getAllRecipes: async (params?: {
    page?: number
    limit?: number
    title?: string
    category?: string[]
    tags?: string[]
    cuisine?: string
    difficulty?: string
    author?: string
    favorites?: boolean
  }): Promise<{
    data: Recipe[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> => {
    try {
      const response = await api.get('/recipes', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 获取单个食谱
  getRecipe: async (id: string): Promise<{ data: Recipe }> => {
    try {
      console.log('API层: 请求食谱详情, ID:', id)
      const response = await api.get(`/recipes/${id}`)
      console.log('API层: 获取到食谱详情响应:', response)

      // 适配服务器响应结构
      if (response.data && response.data.data) {
        // 已经包含正确的格式
        return response.data
      } else if (response.data) {
        // 可能直接返回了数据对象
        return { data: response.data }
      } else {
        console.error('API响应格式不正确')
        throw new Error('获取食谱详情失败: 响应格式不正确')
      }
    } catch (error) {
      console.error('API层: 获取食谱详情失败:', error)
      throw error
    }
  },

  // 创建新食谱
  createRecipe: async (recipe: Partial<Recipe>): Promise<{ data: Recipe }> => {
    try {
      const response = await api.post('/recipes', recipe)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 更新食谱
  updateRecipe: async (id: string, recipe: Partial<Recipe>): Promise<{ data: Recipe }> => {
    try {
      const response = await api.put(`/recipes/${id}`, recipe)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 删除食谱
  deleteRecipe: async (id: string): Promise<void> => {
    try {
      await api.delete(`/recipes/${id}`)
    } catch (error) {
      throw error
    }
  },

  // 获取用户创建的食谱
  getUserRecipes: async (
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{
    data: Recipe[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> => {
    try {
      const response = await api.get(`/recipes/user/${userId}`, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 获取用户收藏的食谱
  getFavoriteRecipes: async (params?: {
    page?: number
    limit?: number
  }): Promise<{
    data: Recipe[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> => {
    try {
      const response = await api.get('/recipes/favorites', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 切换收藏状态
  toggleFavorite: async (id: string): Promise<{ data: Recipe }> => {
    try {
      const response = await api.post(`/recipes/${id}/favorite`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default {
  user: userApi,
  recipe: recipeApi,
}
