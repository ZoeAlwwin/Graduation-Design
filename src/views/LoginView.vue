<script setup lang="ts">
/**
 * 登录视图组件
 * 功能：用户登录，支持记住用户和跳转到注册页面
 * 包含：登录表单、错误提示、记住账号选项和注册引导
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
    router.push(route.query.redirect?.toString() || '/')
  }
})

// 监听路由变化，重置表单
watch(
  () => route.path,
  () => {
    // 重置表单数据
    formData.username = ''
    formData.password = ''
    formData.rememberMe = false
    // 重置错误信息
    errors.username = ''
    errors.password = ''
  },
)

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

// 表单验证错误信息
const errors = reactive({
  username: '',
  password: '',
})

// 是否正在提交
const isSubmitting = ref(false)

// 是否显示密码
const showPassword = ref(false)

// 切换密码显示状态
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 用户名或密码聚焦时清除错误
const clearErrorOnFocus = (field: 'username' | 'password') => {
  errors[field] = ''
}

// 处理登录
const handleLogin = async () => {
  if (!formData.username || !formData.password) {
    errors.username = '请填写用户名和密码'
    return
  }

  try {
    isSubmitting.value = true
    errors.username = ''
    await userStore.login(formData)
    // 登录成功后跳转到主页
    router.push('/')
  } catch (err) {
    console.error('登录失败:', err)
    errors.username = err instanceof Error ? err.message : '登录失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}

// 使用演示账号登录
const useDemoAccount = () => {
  formData.username = 'demo'
  formData.password = 'password123'
  handleLogin()
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-banner">
        <div class="banner-content">
          <div class="logo">
            <img src="/logo.svg" alt="Logo" />
          </div>
          <h2>探索美食的世界</h2>
          <p>加入我们的食谱管理系统，记录和分享您的烹饪灵感</p>
        </div>
      </div>

      <div class="login-form-container">
        <div class="form-header">
          <h1>欢迎回来</h1>
          <p>请登录您的账号以继续</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
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
            <label for="password">密码</label>
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

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="formData.rememberMe" />
              <span>记住我</span>
            </label>
            <router-link to="/forgot-password" class="forgot-password">忘记密码?</router-link>
          </div>

          <p v-if="userStore.loginError" class="login-error">{{ userStore.loginError }}</p>

          <div class="form-actions">
            <button type="submit" class="login-button" :disabled="isSubmitting">
              {{ isSubmitting ? '登录中...' : '登录' }}
            </button>
            <button type="button" class="demo-button" @click="useDemoAccount">使用演示账号</button>
          </div>

          <div class="register-link">
            还没有账号? <router-link to="/register">立即注册</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--light-bg-color);
  padding: 1rem;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.login-banner {
  display: none;
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff9a9e 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.login-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://source.unsplash.com/random/600x800/?food,cooking');
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

.login-form-container {
  flex: 1;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
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

.login-form {
  max-width: 380px;
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

.input-wrapper {
  position: relative;
}

input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type='text']:focus,
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
.login-error {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.login-error {
  text-align: center;
  margin-bottom: 1rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.remember-me input {
  margin: 0;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.login-button {
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

.login-button:hover:not(:disabled) {
  background-color: #ff5252;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.demo-button {
  background-color: #f0f0f0;
  color: #666;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.demo-button:hover {
  background-color: #e0e0e0;
}

.register-link {
  text-align: center;
  color: #666;
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .login-container {
    flex-direction: row;
  }

  .login-banner {
    display: block;
  }

  .login-form-container {
    padding: 3rem;
  }
}

@media (max-width: 767px) {
  .login-container {
    flex-direction: column;
    min-height: auto;
  }

  .login-form-container {
    padding: 2rem 1.5rem;
  }
}

@media (min-width: 1200px) {
  .login-container {
    max-width: 1100px;
  }

  .banner-content h2 {
    font-size: 2.5rem;
  }

  .banner-content p {
    font-size: 1.2rem;
  }
}
</style>
