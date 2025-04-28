<script setup lang="ts">
/**
 * 食谱详情视图组件
 * 功能：展示单个食谱的详细信息，包括食材、步骤、营养成分等
 * 包含：食谱基本信息、食材列表、烹饪步骤、营养信息、收藏功能和打印分享功能
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { useUserStore } from '@/stores/user'
import { getRecommendedRecipes, getPersonalizedRecommendations } from '@/utils/recommendationEngine'
import type { Recipe } from '@/types/recipe'

// 引入路由和食谱存储
const route = useRoute()
const router = useRouter()
const recipeStore = useRecipeStore()
const userStore = useUserStore()

// 状态定义 - 管理页面数据
const loading = ref(true)
const recipe = ref<Recipe | null>(null)

// 从路由参数获取食谱ID
const recipeId = computed(() => route.params.id as string)

// 加载食谱数据
const loadRecipe = async () => {
  loading.value = true
  recipe.value = null // 重置食谱数据

  try {
    // 从数据库获取食谱数据
    const recipeData = await recipeStore.getRecipeById(recipeId.value)

    if (recipeData) {
      // 确保正确设置isFavorite状态
      recipe.value = recipeData

      // 双重检查收藏状态
      if (recipe.value && typeof recipe.value.isFavorite === 'undefined') {
        recipe.value.isFavorite = recipeStore.isRecipeFavorited(recipe.value.id)
        console.log('初始化收藏状态:', recipe.value.isFavorite ? '已收藏' : '未收藏')
      }

      // 记录浏览历史，用于AI推荐
      userStore.addToViewHistory(recipeData.id)
    } else {
      // 食谱不存在，跳转到食谱列表
      router.push('/recipes')
    }
  } catch (error) {
    console.error('获取食谱数据失败:', error)
    router.push('/recipes')
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadRecipe()
    }
  },
  { immediate: true },
)

/**
 * 页面初始化时加载食谱数据
 */
onMounted(() => {
  if (recipeId.value) {
    loadRecipe()
  }
})

/**
 * 切换食谱收藏状态
 */
const toggleFavorite = async () => {
  if (recipe.value) {
    try {
      // 调用 API 切换收藏状态
      await recipeStore.toggleFavorite(recipe.value.id)

      // 使用 API 返回的最新数据来更新食谱状态
      // 重新获取最新的食谱数据
      const updatedRecipe = await recipeStore.getRecipeById(recipe.value.id)
      if (updatedRecipe) {
        recipe.value = updatedRecipe
      }

      console.log('收藏状态已更新:', recipe.value.isFavorite ? '已收藏' : '未收藏')
    } catch (error) {
      console.error('收藏操作失败:', error)
    }
  }
}

/**
 * 计算总烹饪时间（准备时间 + 烹饪时间）
 */
const totalTime = computed(() => {
  if (!recipe.value) return 0
  return recipe.value.prepTime + recipe.value.cookTime
})

/**
 * 将难度转换为中文显示
 */
const difficultyText = computed(() => {
  if (!recipe.value) return ''

  switch (recipe.value.difficulty) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return recipe.value.difficulty
  }
})

/**
 * 获取推荐食谱（排除当前食谱）
 */
const relatedRecipes = computed(() => {
  if (!recipe.value) return []

  // 使用AI推荐引擎获取推荐
  // 如果用户有浏览历史，则使用个性化推荐，否则使用基于当前食谱的相似内容推荐
  const userViewHistory = userStore.getViewHistory()
  const allRecipes = recipeStore.recipes

  // 从浏览历史中获取对应的食谱对象
  const viewedRecipes = userViewHistory
    .map((id) => allRecipes.find((r) => r.id === id))
    .filter(Boolean) as Recipe[]

  return viewedRecipes.length > 2
    ? getPersonalizedRecommendations(viewedRecipes, allRecipes, 3)
    : getRecommendedRecipes(recipe.value, allRecipes, 3)
})

// 判断推荐类型
const isPersonalized = computed(() => {
  const userViewHistory = userStore.getViewHistory()
  const viewedRecipes = recipeStore.recipes.filter((r) => userViewHistory.includes(r.id))

  return viewedRecipes.length > 2
})

/**
 * 打印当前食谱
 */
const printRecipe = () => {
  window.print()
}

/**
 * 分享食谱 - 使用Web Share API
 */
const shareRecipe = () => {
  if (navigator.share && recipe.value) {
    navigator
      .share({
        title: recipe.value.title,
        text: recipe.value.description,
        url: window.location.href,
      })
      .catch((error) => console.log('分享失败', error))
  } else {
    alert('您的浏览器不支持分享功能，请手动复制链接分享')
  }
}

/**
 * 返回上一页
 */
const goBack = () => {
  // 如果有历史记录，返回上一页
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，返回食谱列表
    router.push('/recipes')
  }
}
</script>

<template>
  <div class="recipe-detail-page">
    <button class="back-btn" @click="goBack">←</button>
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>

    <div v-else-if="!recipe" class="not-found">
      <p>未找到该食谱，可能已被删除</p>
      <router-link to="/recipes" class="back-link">返回食谱列表</router-link>
    </div>

    <div v-else class="recipe-detail">
      <div class="recipe-header">
        <div class="recipe-title-container">
          <h1>{{ recipe.title }}</h1>
          <div class="recipe-actions">
            <button
              @click="toggleFavorite"
              class="action-btn favorite-btn"
              :class="{ 'is-favorite': recipe.isFavorite }"
            >
              <i
                class="fa-heart"
                :class="recipe.isFavorite ? 'fa-solid' : 'fa-regular'"
                :style="{ color: recipe.isFavorite ? '#ff4444' : '#666' }"
              ></i>
              <span>{{ recipe.isFavorite ? '已收藏' : '收藏' }}</span>
            </button>
            <button @click="printRecipe" class="action-btn">🖨️ 打印</button>
            <button @click="shareRecipe" class="action-btn">📤 分享</button>
          </div>
        </div>

        <div class="recipe-meta">
          <div class="meta-item">
            <span class="meta-label">准备时间</span>
            <span class="meta-value">{{ recipe.prepTime }} 分钟</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">烹饪时间</span>
            <span class="meta-value">{{ recipe.cookTime }} 分钟</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">总时间</span>
            <span class="meta-value">{{ totalTime }} 分钟</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">份量</span>
            <span class="meta-value">{{ recipe.servings }} 人份</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">难度</span>
            <span class="meta-value">{{ difficultyText }}</span>
          </div>
        </div>

        <div class="recipe-image-container">
          <img :src="recipe.image" :alt="recipe.title" class="recipe-image" />
        </div>

        <div class="recipe-tags">
          <span v-for="tag in recipe.tags" :key="tag" class="recipe-tag">{{ tag }}</span>
        </div>

        <div class="recipe-description">
          <p>{{ recipe.description }}</p>
        </div>
      </div>

      <div class="recipe-content">
        <div class="content-layout">
          <div class="content-columns">
            <div class="ingredients-container">
              <h2>食材</h2>
              <ul class="ingredients-list">
                <li
                  v-for="(ingredient, index) in recipe.ingredients"
                  :key="index"
                  class="ingredient-item"
                >
                  <span class="ingredient-name">{{ ingredient }}</span>
                </li>
              </ul>
            </div>

            <div class="nutrition-container" v-if="recipe.nutrition">
              <h2>营养成分</h2>
              <div class="nutrition-info">
                <div class="nutrition-item">
                  <span class="nutrition-value">{{ recipe.nutrition.calories }}</span>
                  <span class="nutrition-label">热量(千卡)</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-value">{{ recipe.nutrition.protein }}g</span>
                  <span class="nutrition-label">蛋白质</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-value">{{ recipe.nutrition.carbs }}g</span>
                  <span class="nutrition-label">碳水</span>
                </div>
                <div class="nutrition-item">
                  <span class="nutrition-value">{{ recipe.nutrition.fat }}g</span>
                  <span class="nutrition-label">脂肪</span>
                </div>
              </div>
            </div>
          </div>

          <div class="steps-container">
            <h2>烹饪步骤</h2>
            <div class="steps-list">
              <div v-for="(step, index) in recipe.steps" :key="index" class="step-item">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <p>{{ step }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="recipe-footer">
        <div class="recipe-author">
          <p>作者: {{ recipe.author.username }}</p>
          <p>创建时间: {{ new Date(recipe.createdAt).toLocaleDateString() }}</p>
        </div>

        <div class="related-recipes">
          <h3>您可能还喜欢</h3>
          <p class="ai-recommendation-note">
            {{ isPersonalized ? '基于您的浏览历史，AI为您推荐' : '基于相似内容，AI为您推荐' }}
          </p>
          <div class="related-recipe-cards">
            <div
              v-for="relatedRecipe in relatedRecipes"
              :key="relatedRecipe.id"
              class="related-recipe-card"
              :title="`基于相似内容推荐`"
            >
              <div
                class="related-recipe-image"
                :style="{ backgroundImage: `url(${relatedRecipe.image})` }"
              ></div>
              <div class="related-recipe-content">
                <h4>{{ relatedRecipe.title }}</h4>
                <div class="related-recipe-tags">
                  <span v-if="relatedRecipe.category.length > 0" class="related-tag">{{
                    relatedRecipe.category[0]
                  }}</span>
                  <span v-if="relatedRecipe.tags.length > 0" class="related-tag">{{
                    relatedRecipe.tags[0]
                  }}</span>
                </div>
                <router-link :to="`/recipe/${relatedRecipe.id}`" class="view-related-btn"
                  >查看</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipe-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.loading,
.not-found {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: var(--transition);
}

.back-link:hover {
  background-color: #ff5252;
}

.recipe-detail {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.recipe-header {
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.recipe-title-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.recipe-title-container h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 2rem;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

.favorite-btn {
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.favorite-btn.is-favorite {
  background-color: #fff0f0;
  border-color: #ffcccc;
}

.favorite-btn i {
  font-size: 1.2rem;
  transition: var(--transition);
}

.favorite-btn:hover i {
  transform: scale(1.2);
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.meta-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.meta-value {
  font-weight: 500;
  color: var(--text-color);
}

.recipe-image-container {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: var(--shadow);
}

.recipe-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.recipe-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  font-size: 0.875rem;
}

.recipe-description {
  line-height: 1.6;
  color: #444;
}

.recipe-content {
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.content-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-columns {
  display: flex;
  gap: 2rem;
}

.ingredients-container {
  flex: 3;
}

.nutrition-container {
  flex: 2;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 1.5rem;
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredient-item {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px dashed var(--border-color);
}

.ingredient-amount {
  width: 30%;
  color: #666;
}

.ingredient-name {
  flex: 1;
  font-weight: 500;
}

.nutrition-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.nutrition-item {
  text-align: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.nutrition-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.nutrition-label {
  font-size: 0.875rem;
  color: #666;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-item {
  display: flex;
  gap: 1.5rem;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content p {
  margin-top: 0;
  line-height: 1.6;
}

.step-image {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 1rem;
}

.recipe-footer {
  padding: 2rem;
}

.recipe-author {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 2rem;
}

.recipe-author p {
  margin: 0.25rem 0;
}

.related-recipes {
  margin-top: 3rem;
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
}

.related-recipes h3 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: var(--text-color);
}

.ai-recommendation-note {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-style: italic;
}

.related-recipe-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.related-recipe-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.related-recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.related-recipe-image {
  height: 160px;
  background-size: cover;
  background-position: center;
}

.related-recipe-content {
  padding: 1rem;
  position: relative;
}

.related-recipe-content h4 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: var(--text-color);
  height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.related-recipe-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.related-tag {
  background-color: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-related-btn {
  display: inline-block;
  padding: 0.4rem 1rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.view-related-btn:hover {
  background-color: #ff5252;
}

/* 打印样式 */
@media print {
  .recipe-actions,
  .recipe-footer,
  .back-link {
    display: none;
  }

  .recipe-detail-page {
    max-width: 100%;
    padding: 0;
  }

  .recipe-detail {
    box-shadow: none;
  }
}

@media (min-width: 1024px) {
  .content-layout {
    flex-direction: row;
  }

  .content-columns {
    flex: 1;
    flex-direction: column;
  }

  .steps-container {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .recipe-title-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-columns {
    flex-direction: column;
  }

  .related-recipe-cards {
    grid-template-columns: 1fr;
  }

  .recipe-image-container {
    max-width: 100%;
  }

  .recipe-image {
    height: 300px;
  }
}

.back-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
