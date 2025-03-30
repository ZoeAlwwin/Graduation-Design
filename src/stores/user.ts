/**
 * 用户状态管理模块
 * 使用Pinia管理用户数据，包括用户的注册、登录、登出等功能
 * 数据持久化使用后端API实现
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/services/api'

export interface User {
  id: string
  username: string
  email: string
  avatar: string
  createdAt: string
  bio?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export const useUserStore = defineStore('user', () => {
  // 状态定义
  const currentUser = ref<User | null>(null)
  const isLoggedIn = computed(() => !!currentUser.value)
  const loginError = ref('')
  const registerError = ref('')
  const isInitialized = ref(false)
  const isLoading = ref(false)

  // 初始化用户数据
  const initialize = async () => {
    if (isInitialized.value) return

    isLoading.value = true

    try {
      // 检查是否有token
      const token = localStorage.getItem('token')
      if (token) {
        // 从后端获取当前用户信息
        const response = await userApi.getCurrentUser()
        currentUser.value = response.user
      }
    } catch (error) {
      console.error('初始化用户数据失败:', error)
      // 如果获取用户信息失败，清除token
      localStorage.removeItem('token')
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  // 用户登录
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    loginError.value = ''
    isLoading.value = true

    try {
      // 调用登录API
      const response = await userApi.login(credentials)
      // 更新状态
      currentUser.value = response.user
      return true
    } catch (error: any) {
      // 处理登录错误
      loginError.value = typeof error === 'string' ? error : '登录失败，请稍后重试'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 用户注册
  const register = async (data: RegisterData): Promise<boolean> => {
    registerError.value = ''
    isLoading.value = true

    try {
      // 调用注册API
      const response = await userApi.register(data)
      // 更新状态
      currentUser.value = response.user
      return true
    } catch (error: any) {
      // 处理注册错误
      registerError.value = typeof error === 'string' ? error : '注册失败，请稍后重试'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 用户登出
  const logout = () => {
    // 清除用户数据
    currentUser.value = null
    // 调用登出API（清除token）
    userApi.logout()
  }

  // 更新用户资料
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!currentUser.value) return false
    isLoading.value = true

    try {
      // 调用更新资料API
      const response = await userApi.updateProfile(data)
      // 更新状态
      currentUser.value = response.user
      return true
    } catch (error) {
      console.error('更新资料失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 更改密码
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    isLoading.value = true

    try {
      // 调用更改密码API
      await userApi.changePassword({ currentPassword, newPassword })
      return true
    } catch (error) {
      console.error('更改密码失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    currentUser,
    isLoggedIn,
    loginError,
    registerError,
    isInitialized,
    isLoading,

    // 方法
    initialize,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  }
})
