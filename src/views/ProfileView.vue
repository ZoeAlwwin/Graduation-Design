<script setup lang="ts">
/**
 * 用户资料视图组件
 * 功能：显示和编辑用户个人资料
 * 包含：用户头像、个人信息编辑和密码修改功能
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import type { User } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 初始化用户存储
onMounted(() => {
  userStore.initialize()

  // 如果未登录，重定向到登录页面
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  // 用当前用户数据初始化表单
  if (userStore.currentUser) {
    formData.username = userStore.currentUser.username
    formData.email = userStore.currentUser.email
    formData.bio = userStore.currentUser.bio || ''
    formData.avatar = userStore.currentUser.avatar
  }
})

// 用户信息
const currentUser = computed(() => userStore.currentUser)

// 是否处于编辑模式
const isEditing = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  bio: '',
  avatar: '',
})

// 表单错误信息
const errors = reactive({
  username: '',
  email: '',
  bio: '',
  avatar: '',
})

// 是否正在提交
const isSubmitting = ref(false)

// 提交成功消息
const successMessage = ref('')

// 开始编辑
const startEditing = () => {
  isEditing.value = true
  successMessage.value = ''
}

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false
  // 重置表单数据为当前用户数据
  if (currentUser.value) {
    formData.username = currentUser.value.username
    formData.email = currentUser.value.email
    formData.bio = currentUser.value.bio || ''
    formData.avatar = currentUser.value.avatar
  }
  // 清除错误信息
  errors.username = ''
  errors.email = ''
  errors.bio = ''
  errors.avatar = ''
}

// 验证表单
const validateForm = () => {
  let isValid = true

  // 验证用户名
  if (!formData.username.trim()) {
    errors.username = '用户名不能为空'
    isValid = false
  } else if (formData.username.length < 3) {
    errors.username = '用户名长度至少为3个字符'
    isValid = false
  }

  // 验证邮箱
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email.trim()) {
    errors.email = '邮箱不能为空'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  // 验证头像链接
  if (!formData.avatar.trim()) {
    errors.avatar = '头像链接不能为空'
    isValid = false
  }

  return isValid
}

// 保存用户资料
const saveProfile = () => {
  if (!validateForm()) return

  isSubmitting.value = true

  // 创建更新数据对象
  const updateData: Partial<User> = {
    username: formData.username,
    email: formData.email,
    bio: formData.bio,
    avatar: formData.avatar,
  }

  // 调用更新方法
  const success = userStore.updateProfile(updateData)

  isSubmitting.value = false

  if (success) {
    isEditing.value = false
    successMessage.value = '个人资料已成功更新！'
  }
}

// 更换随机头像
const changeRandomAvatar = () => {
  const timestamp = new Date().getTime()
  formData.avatar = `https://source.unsplash.com/random/200x200/?portrait&t=${timestamp}`
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="profile-view">
    <div v-if="currentUser" class="profile-container">
      <div class="profile-header">
        <h1>个人资料</h1>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <div class="profile-content">
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <img
              :src="isEditing ? formData.avatar : currentUser.avatar"
              :alt="currentUser.username"
              class="profile-avatar"
            />
            <button
              v-if="isEditing"
              @click="changeRandomAvatar"
              class="change-avatar-btn"
              title="更换随机头像"
            >
              🔄
            </button>
          </div>

          <div v-if="isEditing" class="avatar-url-input">
            <label for="avatar">头像链接</label>
            <input
              type="text"
              id="avatar"
              v-model="formData.avatar"
              placeholder="请输入头像图片链接"
            />
            <p v-if="errors.avatar" class="error-text">{{ errors.avatar }}</p>
          </div>
        </div>

        <div class="profile-info-section">
          <div v-if="!isEditing" class="profile-info">
            <div class="info-group">
              <h2>{{ currentUser.username }}</h2>
              <p class="email">{{ currentUser.email }}</p>
              <p class="join-date">加入时间：{{ formatDate(currentUser.createdAt) }}</p>
              <p v-if="currentUser.bio" class="bio">{{ currentUser.bio }}</p>
              <p v-else class="bio empty">暂无个人简介</p>
            </div>

            <button @click="startEditing" class="edit-profile-btn">编辑资料</button>
          </div>

          <form v-else @submit.prevent="saveProfile" class="profile-form">
            <div class="form-group">
              <label for="username">用户名</label>
              <input
                type="text"
                id="username"
                v-model="formData.username"
                placeholder="请输入用户名"
              />
              <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
            </div>

            <div class="form-group">
              <label for="email">电子邮箱</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                placeholder="请输入电子邮箱"
              />
              <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
            </div>

            <div class="form-group">
              <label for="bio">个人简介</label>
              <textarea
                id="bio"
                v-model="formData.bio"
                placeholder="分享一些关于你自己的信息..."
                rows="4"
              ></textarea>
              <p v-if="errors.bio" class="error-text">{{ errors.bio }}</p>
            </div>

            <div class="form-actions">
              <button type="button" @click="cancelEditing" class="cancel-btn">取消</button>
              <button type="submit" class="save-btn" :disabled="isSubmitting">
                {{ isSubmitting ? '保存中...' : '保存更改' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-else class="loading-profile">加载中...</div>
  </div>
</template>

<style scoped>
.profile-view {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.profile-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 900px;
  overflow: hidden;
}

.profile-header {
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.profile-header h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.8rem;
}

.success-message {
  color: #48bb78;
  margin-top: 0.5rem;
  font-weight: 500;
}

.profile-content {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--primary-color);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: var(--transition);
}

.change-avatar-btn:hover {
  background-color: #ff5252;
  transform: scale(1.05);
}

.avatar-url-input {
  width: 100%;
  max-width: 400px;
  margin-top: 1rem;
}

.profile-info-section {
  flex: 1;
}

.profile-info {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-group {
  flex: 1;
}

.info-group h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: var(--text-color);
}

.email {
  color: #666;
  margin-bottom: 0.5rem;
}

.join-date {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.bio {
  line-height: 1.6;
  color: #444;
}

.bio.empty {
  color: #999;
  font-style: italic;
}

.edit-profile-btn {
  align-self: flex-start;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 2rem;
}

.edit-profile-btn:hover {
  background-color: #3dbdb4;
}

.profile-form {
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

input[type='text'],
input[type='email'],
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type='text']:focus,
input[type='email']:focus,
textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

.error-text {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: #666;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.cancel-btn:hover {
  background-color: #f0f0f0;
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.save-btn:hover:not(:disabled) {
  background-color: #ff5252;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-profile {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.1rem;
  color: #666;
}

@media (min-width: 768px) {
  .profile-content {
    flex-direction: row;
    gap: 2rem;
  }

  .profile-avatar-section {
    width: 200px;
    margin-bottom: 0;
  }

  .profile-info-section {
    flex: 1;
  }
}

@media (max-width: 767px) {
  .profile-container {
    border-radius: 0;
  }

  .profile-header {
    padding: 1.5rem;
  }

  .profile-content {
    padding: 1.5rem;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
  }
}
</style>
