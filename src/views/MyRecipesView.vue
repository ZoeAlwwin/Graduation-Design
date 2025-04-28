<script setup lang="ts">
/**
 * 我的食谱视图组件
 * 功能：展示用户收藏的食谱和用户创建的食谱
 * 包含：标签页切换、食谱卡片列表、收藏管理和删除功能
 */
import { ref, onMounted, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'
import type { Recipe } from '@/types/recipe'

const recipeStore = useRecipeStore()
const userStore = useUserStore()
const route = useRoute()

// 收藏的食谱
const favoriteRecipes = ref<Recipe[]>([])

// 用户创建的食谱
const userRecipes = ref<Recipe[]>([])

// 当前显示的标签页（收藏/我的创建）
const activeTab = ref('favorites')

// 加载状态
const isLoading = ref(false)

// 错误信息
const error = ref('')

// 切换标签页
const setActiveTab = async (tab: string) => {
  activeTab.value = tab
  await loadData()
}

// 加载收藏的食谱
const loadFavoriteRecipes = async () => {
  try {
    isLoading.value = true
    // 直接使用返回的数据设置本地状态，不影响全局食谱列表
    const favRecipes = await recipeStore.fetchFavoriteRecipes()
    favoriteRecipes.value = favRecipes
    console.log('加载收藏食谱成功, 共加载', favRecipes.length, '条数据')
  } catch (error) {
    console.error('加载收藏食谱失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载创建的食谱
const loadCreatedRecipes = async () => {
  try {
    isLoading.value = true
    const data = await recipeStore.fetchUserRecipes(userStore.currentUser?.id || '')
    userRecipes.value = data
  } catch (error) {
    console.error('加载创建的食谱失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 加载数据
const loadData = async () => {
  isLoading.value = true
  error.value = ''

  try {
    if (activeTab.value === 'favorites') {
      await loadFavoriteRecipes()
    } else {
      await loadCreatedRecipes()
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    error.value = err instanceof Error ? err.message : '加载数据失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 取消收藏
const toggleFavorite = async (id: string) => {
  try {
    await recipeStore.toggleFavorite(id)
    // 重新加载数据
    await loadData()
  } catch (error) {
    console.error('取消收藏失败:', error)
  }
}

// 删除食谱
const confirmDelete = async (id: string) => {
  if (confirm('确定要删除这个食谱吗？此操作不可恢复。')) {
    try {
      await recipeStore.deleteRecipe(id)
      // 重新加载数据
      await loadData()
    } catch (error) {
      console.error('删除食谱失败:', error)
    }
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  if (activeTab.value === 'favorites') {
    await loadFavoriteRecipes()
  } else {
    await loadCreatedRecipes()
  }
})

// 监听路由变化，重新加载数据
watch(
  () => route.path,
  async () => {
    await loadData()
  },
)

// 监听用户状态变化，重新加载数据
watch(
  () => userStore.currentUser,
  async () => {
    await loadData()
  },
)

// 监听标签页变化，重新加载数据
watch(
  () => activeTab.value,
  async () => {
    await loadData()
  },
)
</script>

<template>
  <div class="my-recipes-view">
    <div class="page-header">
      <h1>我的食谱</h1>

      <!-- 标签页切换按钮 -->
      <div class="tab-buttons">
        <button
          @click="setActiveTab('favorites')"
          :class="{ active: activeTab === 'favorites' }"
          class="tab-button"
        >
          收藏的食谱
        </button>
        <button
          @click="setActiveTab('myRecipes')"
          :class="{ active: activeTab === 'myRecipes' }"
          class="tab-button"
        >
          我创建的食谱
        </button>
      </div>
    </div>

    <!-- 收藏的食谱标签页 -->
    <div v-if="activeTab === 'favorites'" class="tab-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-button">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="favoriteRecipes.length === 0" class="empty-state">
        <p>还没有收藏任何食谱</p>
        <router-link to="/recipes" class="action-link">浏览食谱</router-link>
      </div>

      <!-- 食谱列表 -->
      <div v-else class="recipe-cards">
        <div v-for="recipe in favoriteRecipes" :key="recipe.id" class="recipe-card">
          <div class="recipe-image-container">
            <img :src="recipe.image" :alt="recipe.title" class="recipe-image" />
          </div>

          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>

            <div class="recipe-meta">
              <span title="准备时间"><i class="meta-icon">⏱️</i> {{ recipe.prepTime }} 分钟</span>
              <span title="烹饪时间"><i class="meta-icon">🍳</i> {{ recipe.cookTime }} 分钟</span>
            </div>

            <div class="recipe-tags">
              <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              <span v-if="recipe.tags.length > 3" class="tag more-tag"
                >+{{ recipe.tags.length - 3 }}</span
              >
            </div>

            <div class="recipe-actions">
              <router-link :to="`/recipe/${recipe.id}`" class="action-button view-button">
                查看详情
              </router-link>
              <button @click="toggleFavorite(recipe.id)" class="action-button favorite-button">
                取消收藏
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我创建的食谱标签页 -->
    <div v-if="activeTab === 'myRecipes'" class="tab-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadData" class="retry-button">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="userRecipes.length === 0" class="empty-state">
        <p>您还没有创建任何食谱</p>
        <router-link to="/add-recipe" class="action-link">创建第一个食谱</router-link>
      </div>

      <!-- 食谱列表 -->
      <div v-else class="recipe-cards">
        <div v-for="recipe in userRecipes" :key="recipe.id" class="recipe-card">
          <div class="recipe-image-container">
            <img :src="recipe.image" :alt="recipe.title" class="recipe-image" />
          </div>

          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>

            <div class="recipe-meta">
              <span title="准备时间"><i class="meta-icon">⏱️</i> {{ recipe.prepTime }} 分钟</span>
              <span title="烹饪时间"><i class="meta-icon">🍳</i> {{ recipe.cookTime }} 分钟</span>
            </div>

            <div class="recipe-tags">
              <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              <span v-if="recipe.tags.length > 3" class="tag more-tag"
                >+{{ recipe.tags.length - 3 }}</span
              >
            </div>

            <div class="recipe-actions">
              <router-link :to="`/recipe/${recipe.id}`" class="action-button view-button">
                查看
              </router-link>
              <router-link :to="`/edit-recipe/${recipe.id}`" class="action-button edit-button">
                编辑
              </router-link>
              <button @click="confirmDelete(recipe.id)" class="action-button delete-button">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面整体布局样式 */
.my-recipes-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  padding-bottom: 3rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

h1 {
  margin: 0;
  color: var(--text-color);
}

/* 标签页切换按钮样式 */
.tab-buttons {
  display: flex;
  gap: 1rem;
}

.tab-button {
  padding: 0.7rem 1.2rem;
  border: none;
  background-color: #f0f0f0;
  color: #666;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.tab-button.active {
  background-color: var(--primary-color);
  color: white;
}

/* 标签页内容样式 */
.tab-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 2rem;
}

.tab-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.add-recipe-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.add-recipe-button:hover {
  background-color: #ff5252;
}

.add-icon {
  font-size: 1.1rem;
}

/* 空状态提示样式 */
.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.action-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.action-link:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

/* 食谱卡片列表样式 */
.recipe-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.recipe-card {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.recipe-image-container {
  position: relative;
  height: 180px;
  background-size: cover;
  background-position: center;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content {
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-description {
  color: #666;
  margin: 0.5rem 0 1rem;
  line-height: 1.4;
  flex: 1;
}

/* 标签样式 */
.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.tag {
  background-color: #f1f1f1;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #666;
}

.more-tag {
  background-color: #e0e0e0;
}

/* 食谱元数据样式 */
.recipe-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.meta-icon {
  margin-right: 0.3rem;
}

/* 操作按钮样式 */
.recipe-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: auto;
}

.action-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  flex: 1;
  transition: var(--transition);
  border: none;
}

.view-button {
  background-color: var(--secondary-color);
  color: white;
  text-decoration: none;
}

.view-button:hover {
  background-color: #3dbdb4;
}

.edit-button {
  background-color: var(--accent-color);
  color: #333;
  text-decoration: none;
}

.edit-button:hover {
  background-color: #ffc633;
}

.favorite-button {
  background-color: var(--primary-color);
  color: white;
}

.favorite-button:hover {
  background-color: #ff5252;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.delete-button:hover {
  background-color: #d32f2f;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tab-content {
    padding: 1.5rem;
  }

  .recipe-cards {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tab-buttons {
    width: 100%;
  }

  .tab-button {
    flex: 1;
    text-align: center;
  }
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态样式 */
.error-state {
  text-align: center;
  padding: 3rem 0;
  color: #f44336;
}

.retry-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}

.retry-button:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

/* 移除收藏按钮样式 */
.favorite-btn {
  display: none;
}
</style>
