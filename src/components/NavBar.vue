<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="logo">
        <img src="@/assets/logo.svg" alt="Logo" />
      </router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/my-recipes" class="nav-link">我的食谱</router-link>
        <router-link to="/favorites" class="nav-link">收藏夹</router-link>
        <router-link to="/categories" class="nav-link">分类</router-link>
      </div>
    </div>

    <div class="nav-right">
      <div class="search-box">
        <ElInput
          v-model="searchQuery"
          placeholder="搜索食谱..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </ElInput>
      </div>

      <div class="user-section">
        <template v-if="isAuthenticated">
          <ElDropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <button class="avatar-button">
                <img
                  :src="
                    userStore.currentUser?.avatar ||
                    'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
                  "
                  alt="用户头像"
                  class="avatar-image"
                />
              </button>
              <span class="username">{{ userStore.currentUser?.username }}</span>
              <i class="el-icon-arrow-down"></i>
            </div>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="profile">
                  <i class="el-icon-user"></i> 个人中心
                </ElDropdownItem>
                <ElDropdownItem command="settings">
                  <i class="el-icon-setting"></i> 设置
                </ElDropdownItem>
                <ElDropdownItem divided command="logout">
                  <i class="el-icon-switch-button"></i> 退出登录
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <ElButton type="primary" @click="showLoginModal = true" class="login-btn">
              登录
            </ElButton>
            <ElButton @click="showRegisterModal = true" class="register-btn"> 注册 </ElButton>
          </div>
        </template>
      </div>
    </div>
  </nav>

  <!-- 登录模态框 -->
  <ElDialog
    v-model="showLoginModal"
    title="登录"
    width="400px"
    :close-on-click-modal="false"
    class="login-dialog"
  >
    <LoginForm @success="handleLoginSuccess" />
  </ElDialog>

  <!-- 注册模态框 -->
  <ElDialog
    v-model="showRegisterModal"
    title="注册"
    width="400px"
    :close-on-click-modal="false"
    class="register-dialog"
  >
    <RegisterForm @success="handleRegisterSuccess" />
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  ElInput,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElDialog,
} from 'element-plus'
import LoginForm from '@/components/LoginForm.vue'
import RegisterForm from '@/components/RegisterForm.vue'

const router = useRouter()
const userStore = useUserStore()

// 计算属性：用户是否已登录
const isAuthenticated = computed(() => userStore.isLoggedIn)

// 搜索功能
const searchQuery = ref('')
const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
  searchQuery.value = ''
}

// 登录/注册模态框
const showLoginModal = ref(false)
const showRegisterModal = ref(false)

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/')
      break
  }
}

// 登录成功回调
const handleLoginSuccess = () => {
  showLoginModal.value = false
  // 可以在这里添加登录成功后的操作，如显示欢迎信息等
}

// 注册成功回调
const handleRegisterSuccess = () => {
  showRegisterModal.value = false
  showLoginModal.value = true
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo img {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #606266;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #409eff;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #409eff;
  transition: width 0.3s;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-box {
  width: 300px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-input :deep(.el-input__inner) {
  padding-left: 40px;
}

.search-input :deep(.el-input__prefix) {
  left: 15px;
  color: #909399;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.avatar-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #409eff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-button:hover {
  border-color: #66b1ff;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.username {
  font-size: 0.9rem;
  color: #606266;
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 0.8rem;
}

.login-btn,
.register-btn {
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 500;
  transition: all 0.3s;
}

.login-btn {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.login-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-1px);
}

.register-btn {
  background-color: #fff;
  border-color: #409eff;
  color: #409eff;
}

.register-btn:hover {
  background-color: #ecf5ff;
  transform: translateY(-1px);
}

:deep(.el-dropdown-menu) {
  padding: 0.5rem 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #606266;
  transition: all 0.3s;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-dropdown-menu__item i) {
  font-size: 1.1rem;
}

:deep(.el-dropdown-menu__item--divided) {
  margin-top: 0.5rem;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 1rem;
  }

  .nav-links {
    display: none;
  }

  .search-box {
    width: 200px;
  }

  .username {
    display: none;
  }

  .auth-buttons {
    gap: 0.5rem;
  }

  .login-btn,
  .register-btn {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
