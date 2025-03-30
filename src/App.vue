<script setup lang="ts">
/**
 * 主应用组件
 * 这是应用程序的根组件，包含整体布局结构（头部导航、主内容区和页脚）
 * 所有页面都将在这个组件内进行渲染
 */
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useRecipeStore } from './stores/recipe'
import { useUserStore } from './stores/user'

// 引入路由和状态存储
const router = useRouter()
const recipeStore = useRecipeStore()
const userStore = useUserStore()

// 添加响应式导航菜单控制
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuContainer = ref(null)

// 登录状态和用户信息
const isLoggedIn = computed(() => userStore.isLoggedIn)
const currentUser = computed(() => userStore.currentUser)

// 确保store初始化
onMounted(() => {
  // 初始化食谱存储
  if (recipeStore.recipes.length === 0) {
    recipeStore.initialize()
  }

  // 初始化用户存储
  userStore.initialize()

  // 添加Material Icons样式链接
  addMaterialIcons()

  // 监听点击事件，点击菜单外部时关闭菜单
  document.addEventListener('click', (event) => {
    if (userMenuContainer.value && !userMenuContainer.value.contains(event.target)) {
      userMenuOpen.value = false
    }
  })
})

// 切换移动导航菜单的显示状态
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // 关闭用户菜单
  if (mobileMenuOpen.value) {
    userMenuOpen.value = false
  }
}

// 切换用户菜单的显示状态
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

// 关闭移动导航菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// 登出操作
const handleLogout = () => {
  userStore.logout()
  // 关闭菜单
  userMenuOpen.value = false
  // 重定向到登录页面
  router.push('/login')
}

// 导入头部样式
const addMaterialIcons = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined'
  document.head.appendChild(link)
}
</script>

<template>
  <div class="app-container">
    <!-- 头部导航区域 -->
    <header>
      <div class="header-inner">
        <div class="logo-container">
          <h1 class="site-title">美味食谱管理</h1>
        </div>

        <!-- 汉堡菜单按钮（仅在移动设备显示） -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="菜单">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <!-- 主导航菜单 -->
        <nav :class="{ 'mobile-open': mobileMenuOpen }">
          <RouterLink to="/" @click="closeMobileMenu">首页</RouterLink>
          <RouterLink to="/recipes" @click="closeMobileMenu">食谱浏览</RouterLink>

          <!-- 登录后才显示的导航项 -->
          <template v-if="isLoggedIn">
            <RouterLink to="/my-recipes" @click="closeMobileMenu">我的食谱</RouterLink>
            <RouterLink to="/add-recipe" @click="closeMobileMenu">添加食谱</RouterLink>
          </template>

          <RouterLink to="/about" @click="closeMobileMenu">关于</RouterLink>

          <!-- 登录/注册链接（仅未登录时显示） -->
          <template v-if="!isLoggedIn">
            <RouterLink to="/login" @click="closeMobileMenu" class="auth-link login-link"
              >登录</RouterLink
            >
            <RouterLink to="/register" @click="closeMobileMenu" class="auth-link register-link"
              >注册</RouterLink
            >
          </template>

          <!-- 用户菜单 -->
          <div v-if="isLoggedIn" class="relative" ref="userMenuContainer">
            <button
              @click="toggleUserMenu"
              class="flex items-center justify-center rounded-full w-10 h-10 overflow-hidden border-2 border-amber-500 hover:border-amber-600 transition-colors"
            >
              <img
                :src="currentUser?.avatar"
                alt="User Avatar"
                class="w-full h-full object-cover"
              />
            </button>

            <!-- 下拉菜单 -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50 py-2"
            >
              <div class="border-b border-gray-200 dark:border-gray-700 pb-2 mb-1 px-4">
                <p class="font-semibold">{{ currentUser?.username }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ currentUser?.email }}
                </p>
              </div>
              <router-link
                to="/profile"
                class="px-4 py-2 hover:bg-amber-100 dark:hover:bg-gray-700 flex items-center transition-colors w-full text-left"
                @click="userMenuOpen = false"
              >
                <span class="material-icons-outlined mr-2 text-sm">person</span>
                个人资料
              </router-link>
              <router-link
                to="/my-recipes"
                class="px-4 py-2 hover:bg-amber-100 dark:hover:bg-gray-700 flex items-center transition-colors w-full text-left"
                @click="userMenuOpen = false"
              >
                <span class="material-icons-outlined mr-2 text-sm">menu_book</span>
                我的食谱
              </router-link>
              <button
                @click="handleLogout"
                class="px-4 py-2 hover:bg-amber-100 dark:hover:bg-gray-700 flex items-center transition-colors w-full text-left"
              >
                <span class="material-icons-outlined mr-2 text-sm">logout</span>
                退出登录
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <!-- 主内容区域 - 路由视图将在这里渲染 -->
    <main>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <!-- 页脚区域 -->
    <footer>
      <div class="footer-inner">
        <p>© 2024 美味食谱管理系统 | 享受烹饪的乐趣</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* 全局CSS变量定义，用于统一色彩和样式主题 */
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  --accent-color: #ffd166;
  --text-color: #2f3542;
  --light-bg-color: #f9f7f7;
  --card-bg-color: #ffffff;
  --border-color: #e8e8e8;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;

  /* 添加响应式断点变量 */
  --container-max-width: 1600px;
  --container-padding-small: 0.5rem;
  --container-padding-medium: 1rem;
  --container-padding-large: 1.5rem;
}

/* 全局重置样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 基础页面样式 */
body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--light-bg-color);
  line-height: 1.6;
}

/* 应用容器布局 - 使用flex实现最小高度占满视口 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

/* 头部导航样式 */
header {
  background-color: white;
  box-shadow: var(--shadow);
  width: 100%;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem var(--container-padding-small);
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

/* 移动端菜单按钮样式 */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 110;
}

.bar {
  display: block;
  width: 25px;
  height: 3px;
  margin: 5px auto;
  background-color: var(--text-color);
  transition: var(--transition);
}

.site-title {
  color: var(--primary-color);
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 2rem);
  white-space: nowrap;
}

/* 导航菜单样式 */
nav {
  display: flex;
  gap: clamp(1rem, 2vw, 1.5rem);
  align-items: center;
}

nav a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: var(--transition);
  white-space: nowrap;
}

nav a:hover {
  color: var(--primary-color);
}

/* 授权链接样式 */
.auth-link {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.login-link {
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.login-link:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.register-link {
  background-color: var(--primary-color);
  color: white;
}

.register-link:hover {
  background-color: #ff5252;
  color: white;
}

/* 活动路由链接样式 */
nav a.router-link-active {
  color: var(--primary-color);
}

nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

/* 用户菜单样式 */
.user-menu-container {
  position: relative;
  margin-left: 1rem;
}

.user-avatar-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  transition: var(--transition);
  border-radius: 20px;
}

.user-avatar-btn:hover {
  background-color: #f0f0f0;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.username-display {
  margin: 0 0.5rem;
  color: var(--text-color);
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-arrow {
  font-size: 0.7rem;
  color: #888;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 0.5rem 0;
  z-index: 100;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  transition: var(--transition);
  font-weight: 400;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.item-icon {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.logout-btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-family: inherit;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  color: #e53e3e;
}

.logout-btn:hover {
  background-color: #f0f0f0;
}

/* 主内容区域样式 */
main {
  flex: 1;
  padding: 0;
  width: 100%;
  max-width: 100%;
}

/* 页脚样式 */
footer {
  background-color: white;
  text-align: center;
  margin-top: auto;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.footer-inner {
  padding: 1.2rem var(--container-padding-small);
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }

  nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    background-color: white;
    flex-direction: column;
    padding: 5rem 1.5rem 2rem;
    z-index: 100;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    align-items: flex-start;
  }

  nav.mobile-open {
    right: 0;
  }

  nav a {
    padding: 0.75rem 0;
    width: 100%;
    border-bottom: 1px solid var(--border-color);
  }

  .auth-link {
    margin-left: 0;
    margin-top: 0.5rem;
    width: 100%;
    text-align: center;
  }

  .user-menu-container {
    width: 100%;
    margin-left: 0;
    margin-top: 1rem;
  }

  .user-avatar-btn {
    width: 100%;
    justify-content: flex-start;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .user-dropdown {
    position: static;
    box-shadow: none;
    margin-top: 0.5rem;
    width: 100%;
    padding: 0;
  }

  .dropdown-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  /* 当菜单打开时添加遮罩层 */
  nav.mobile-open::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .header-inner,
  .footer-inner {
    padding: 0.8rem var(--container-padding-medium);
  }

  .username-display {
    max-width: 80px;
  }
}

@media (min-width: 1025px) {
  .header-inner,
  .footer-inner {
    padding: 0.8rem var(--container-padding-large);
  }

  nav {
    gap: 2rem;
  }
}

@media (min-width: 1440px) {
  :root {
    --container-max-width: 90%;
  }

  .site-title {
    font-size: 2rem;
  }

  nav a {
    font-size: 1.1rem;
  }
}

@media (min-width: 1920px) {
  :root {
    --container-max-width: 1800px;
  }
}
</style>
