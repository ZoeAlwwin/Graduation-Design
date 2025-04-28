<script setup lang="ts">
/**
 * 注册视图组件
 * 功能：用户注册，支持表单验证和跳转到登录页面
 * 包含：注册表单、错误提示和登录引导
 */
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 初始化用户存储
onMounted(() => {
  userStore.initialize()

  // 如果已经登录，重定向到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})

// 监听路由变化，重置表单
watch(
  () => route.path,
  () => {
    // 重置表单数据
    formData.username = ''
    formData.email = ''
    formData.password = ''
    formData.confirmPassword = ''
    // 重置错误信息
    errors.username = ''
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''
  },
)

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
})

// 表单验证错误信息
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: '',
})

// 是否正在提交
const isSubmitting = ref(false)

// 是否显示密码
const showPassword = ref(false)

// 切换密码显示状态
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 字段聚焦时清除错误
const clearErrorOnFocus = (field: keyof typeof errors) => {
  errors[field] = ''
}

// 表单验证
const validateForm = (): boolean => {
  let isValid = true

  // 验证用户名
  if (!formData.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (formData.username.length < 3) {
    errors.username = '用户名长度至少为3个字符'
    isValid = false
  }

  // 验证邮箱
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim()) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  // 验证密码
  if (!formData.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = '密码长度至少为6个字符'
    isValid = false
  }

  // 验证确认密码
  if (!formData.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  // 验证服务条款
  if (!formData.agreeToTerms) {
    errors.agreeToTerms = '请同意服务条款和隐私政策'
    isValid = false
  }

  return isValid
}

// 提交注册表单
const handleSubmit = async () => {
  // 表单验证
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // 调用注册方法
    const success = await userStore.register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })

    if (success) {
      // 注册成功，跳转到首页或重定向URL
      router.push(route.query.redirect?.toString() || '/')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-banner">
        <div class="banner-content">
          <div class="logo">
            <img src="/logo.svg" alt="Logo" />
          </div>
          <h2>开启您的美食之旅</h2>
          <p>注册账号，开始记录和分享您的烹饪创作</p>
        </div>
      </div>

      <div class="register-form-container">
        <div class="form-header">
          <h1>创建账号</h1>
          <p>加入我们的美食社区</p>
        </div>

        <form @submit.prevent="handleSubmit" class="register-form">
          <div class="form-group">
            <label for="username">用户名 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                type="text"
                id="username"
                v-model="formData.username"
                placeholder="请输入用户名"
                @focus="clearErrorOnFocus('username')"
              />
              <span class="input-icon">👤</span>
            </div>
            <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
          </div>

          <div class="form-group">
            <label for="email">邮箱 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                type="email"
                id="email"
                v-model="formData.email"
                placeholder="请输入邮箱"
                @focus="clearErrorOnFocus('email')"
              />
              <span class="input-icon">✉️</span>
            </div>
            <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
          </div>

          <div class="form-group">
            <label for="password">密码 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="formData.password"
                placeholder="请输入密码"
                @focus="clearErrorOnFocus('password')"
              />
              <button
                type="button"
                class="toggle-password"
                @click="togglePasswordVisibility"
                tabindex="-1"
              >
                <span v-if="showPassword">👁️</span>
                <span v-else>🔒</span>
              </button>
            </div>
            <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="formData.confirmPassword"
                placeholder="请再次输入密码"
                @focus="clearErrorOnFocus('confirmPassword')"
              />
              <span class="input-icon">🔒</span>
            </div>
            <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
          </div>

          <div class="form-group terms-group">
            <label class="agree-terms">
              <input
                type="checkbox"
                v-model="formData.agreeToTerms"
                @focus="clearErrorOnFocus('agreeToTerms')"
              />
              <span
                >我已阅读并同意 <a href="#" @click.prevent>服务条款</a> 和
                <a href="#" @click.prevent>隐私政策</a></span
              >
            </label>
            <p v-if="errors.agreeToTerms" class="error-text">{{ errors.agreeToTerms }}</p>
          </div>

          <p v-if="userStore.registerError" class="register-error">{{ userStore.registerError }}</p>

          <div class="form-actions">
            <button type="submit" class="register-button" :disabled="isSubmitting">
              {{ isSubmitting ? '注册中...' : '创建账号' }}
            </button>
          </div>

          <div class="login-link">已有账号? <router-link to="/login">立即登录</router-link></div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--light-bg-color);
  padding: 1rem;
}

.register-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.register-banner {
  display: none;
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff9a9e 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.register-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://source.unsplash.com/random/600x800/?cooking,chef');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
}

.banner-content {
  position: relative;
  z-index: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.banner-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.banner-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
  max-width: 80%;
  margin: 0 auto;
}

.logo {
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
}

.logo img {
  width: 120px;
  height: auto;
}

.register-form-container {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h1 {
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #666;
}

.register-form {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.required {
  color: var(--primary-color);
}

.input-wrapper {
  position: relative;
}

input[type='text'],
input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type='text']:focus,
input[type='email']:focus,
input[type='password']:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0;
  font-size: 1.1rem;
}

.error-text,
.register-error {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.register-error {
  text-align: center;
  margin-bottom: 1rem;
}

.terms-group {
  margin-top: 1rem;
}

.agree-terms {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.agree-terms input {
  margin-top: 0.3rem;
}

.agree-terms span {
  font-size: 0.9rem;
  line-height: 1.5;
}

.agree-terms a {
  color: var(--primary-color);
  text-decoration: none;
}

.agree-terms a:hover {
  text-decoration: underline;
}

.form-actions {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.register-button {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register-button:hover:not(:disabled) {
  background-color: #ff5252;
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  color: #666;
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .register-container {
    flex-direction: row;
  }

  .register-banner {
    display: block;
  }

  .register-form-container {
    padding: 2rem 3rem;
  }
}

@media (max-width: 767px) {
  .register-container {
    flex-direction: column;
    min-height: auto;
  }

  .register-form-container {
    padding: 1.5rem;
  }
}

@media (min-width: 1200px) {
  .register-container {
    max-width: 1100px;
  }

  .banner-content h2 {
    font-size: 2.5rem;
  }

  .banner-content p {
    font-size: 1.2rem;
  }

  .register-form-container {
    padding: 3rem;
  }
}
</style>
