<script setup lang="ts">
/**
 * 食谱列表视图组件
 * 功能：展示所有食谱并提供多条件筛选功能
 * 包含：搜索框、筛选面板和食谱列表展示
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import type { RecipeFilter } from '@/types/recipe'
import { useRoute, useRouter } from 'vue-router'

const recipeStore = useRecipeStore()
const route = useRoute()
const router = useRouter()

// 确保store初始化
onMounted(async () => {
  try {
    // 清空本地缓存
    recipeStore.resetStore()
    // 加载所有食谱数据
    await recipeStore.fetchAllRecipes()
  } catch (error) {
    console.error('加载食谱数据失败:', error)
  }
})

// 监听路由变化，确保每次进入页面时都重新获取数据
watch(
  () => route.path,
  async (newPath) => {
    if (newPath === '/recipes') {
      try {
        // 清空本地缓存
        recipeStore.resetStore()
        // 重置筛选条件
        resetFilter()
        // 加载所有食谱数据
        await recipeStore.fetchAllRecipes()
      } catch (error) {
        console.error('加载食谱数据失败:', error)
      }
    }
  },
  { immediate: true },
)

// 状态定义
const currentPage = ref(1)
const filter = ref<RecipeFilter>({
  search: '',
  category: '',
  tags: [],
  difficulty: undefined,
  maxPrepTime: undefined,
  maxCookTime: undefined,
  ingredients: [],
})

// 是否显示筛选面板
const showFilter = ref(false)

// 分类、标签和难度选项 - 用于筛选面板
const categories = computed(() => recipeStore.categories)
const popularTags = computed(() => recipeStore.popularTags)

// 筛选后的食谱
const filteredRecipes = computed(() => {
  return recipeStore.getFilteredRecipes(filter.value)
})

// 重置筛选条件
const resetFilter = () => {
  filter.value = {
    search: '',
    category: '',
    tags: [],
    difficulty: undefined,
    maxPrepTime: undefined,
    maxCookTime: undefined,
    ingredients: [],
  }
}

// 添加或移除标签筛选
const toggleTag = (tag: string) => {
  if (!filter.value.tags) {
    filter.value.tags = []
  }

  const index = filter.value.tags.indexOf(tag)
  if (index === -1) {
    filter.value.tags.push(tag)
  } else {
    filter.value.tags.splice(index, 1)
  }
}

// 添加或移除食材筛选条件
const addIngredient = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.trim()

  if (!value) return

  if (!filter.value.ingredients) {
    filter.value.ingredients = []
  }

  if (!filter.value.ingredients.includes(value)) {
    filter.value.ingredients.push(value)
  }

  input.value = ''
}

const removeIngredient = (ingredient: string) => {
  if (!filter.value.ingredients) return

  const index = filter.value.ingredients.indexOf(ingredient)
  if (index !== -1) {
    filter.value.ingredients.splice(index, 1)
  }
}

// 添加查看食谱详情方法
const viewRecipe = (id: string) => {
  router.push(`/recipe/${id}`)
}

// 添加难度文本转换方法
const difficultyText = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return '简单'
    case 'medium':
      return '中等'
    case 'hard':
      return '困难'
    default:
      return difficulty
  }
}

// 监听筛选条件变化
watch(
  [
    filter.value.search,
    filter.value.category,
    filter.value.tags,
    filter.value.difficulty,
    filter.value.maxPrepTime,
    filter.value.maxCookTime,
    filter.value.ingredients,
  ],
  async () => {
    // 重置页码
    currentPage.value = 1
    // 重新加载食谱数据
    try {
      await recipeStore.fetchAllRecipes({
        search: filter.value.search,
        category: filter.value.category,
        tags: filter.value.tags,
        difficulty: filter.value.difficulty,
        maxPrepTime: filter.value.maxPrepTime,
        maxCookTime: filter.value.maxCookTime,
        ingredients: filter.value.ingredients,
        page: currentPage.value,
        limit: 12,
      })
    } catch (error) {
      console.error('加载食谱数据失败:', error)
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="recipes-page">
    <div class="page-header">
      <h1>浏览食谱</h1>
      <div class="search-bar">
        <input type="text" v-model="filter.search" placeholder="搜索食谱..." class="search-input" />
        <button @click="showFilter = !showFilter" class="filter-toggle-btn">
          <span v-if="!showFilter">显示筛选</span>
          <span v-else>隐藏筛选</span>
        </button>
      </div>
    </div>

    <div v-if="showFilter" class="filter-panel">
      <div class="filter-section">
        <h3>分类</h3>
        <div class="category-options">
          <label v-for="category in categories" :key="category" class="category-option">
            <input type="radio" :value="category" v-model="filter.category" name="category" />
            <span>{{ category }}</span>
          </label>
          <label class="category-option">
            <input type="radio" value="" v-model="filter.category" name="category" />
            <span>全部</span>
          </label>
        </div>
      </div>

      <div class="filter-section">
        <h3>标签</h3>
        <div class="tag-options">
          <span
            v-for="tag in popularTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="['tag', { active: filter.tags?.includes(tag) }]"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="filter-section">
        <h3>难度</h3>
        <div class="difficulty-options">
          <label class="difficulty-option">
            <input type="radio" value="easy" v-model="filter.difficulty" name="difficulty" />
            <span>简单</span>
          </label>
          <label class="difficulty-option">
            <input type="radio" value="medium" v-model="filter.difficulty" name="difficulty" />
            <span>中等</span>
          </label>
          <label class="difficulty-option">
            <input type="radio" value="hard" v-model="filter.difficulty" name="difficulty" />
            <span>困难</span>
          </label>
          <label class="difficulty-option">
            <input type="radio" :value="undefined" v-model="filter.difficulty" name="difficulty" />
            <span>全部</span>
          </label>
        </div>
      </div>

      <div class="filter-section time-section">
        <div class="time-filter">
          <h3>最长准备时间（分钟）</h3>
          <input type="number" v-model="filter.maxPrepTime" min="0" placeholder="不限" />
        </div>

        <div class="time-filter">
          <h3>最长烹饪时间（分钟）</h3>
          <input type="number" v-model="filter.maxCookTime" min="0" placeholder="不限" />
        </div>
      </div>

      <div class="filter-section">
        <h3>包含的食材</h3>
        <div class="ingredients-input">
          <input type="text" placeholder="输入食材名称" @keyup.enter="addIngredient($event)" />
          <button @click="addIngredient($event)">添加</button>
        </div>
        <div
          v-if="filter.ingredients && filter.ingredients.length > 0"
          class="selected-ingredients"
        >
          <span
            v-for="ingredient in filter.ingredients"
            :key="ingredient"
            class="selected-ingredient"
          >
            {{ ingredient }}
            <button @click="removeIngredient(ingredient)" class="remove-btn">×</button>
          </span>
        </div>
      </div>

      <div class="filter-actions">
        <button @click="resetFilter" class="reset-btn">重置筛选</button>
      </div>
    </div>

    <div class="recipes-container">
      <div v-if="recipeStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="filteredRecipes.length === 0" class="no-recipes">
        <p>未找到符合条件的食谱</p>
      </div>
      <div v-else class="recipe-cards">
        <div
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          class="recipe-card"
          @click="viewRecipe(recipe.id)"
        >
          <div class="recipe-image-container">
            <img :src="recipe.image" :alt="recipe.title" class="recipe-image" />
          </div>
          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <p>{{ recipe.description }}</p>
            <div class="recipe-meta">
              <span class="cook-time">
                <i class="fa-solid fa-clock"></i> {{ recipe.cookTime }}分钟
              </span>
              <span class="difficulty">{{ difficultyText(recipe.difficulty) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipes-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header h1 {
  margin: 0;
  color: var(--text-color);
}

.search-bar {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.filter-toggle-btn {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.filter-toggle-btn:hover {
  background-color: #45b6af;
}

.filter-panel {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: var(--text-color);
}

.category-options,
.difficulty-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.category-option,
.difficulty-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 16px;
  cursor: pointer;
  transition: var(--transition);
}

.tag:hover {
  background-color: #e0e0e0;
}

.tag.active {
  background-color: var(--primary-color);
  color: white;
}

.time-section {
  display: flex;
  gap: 2rem;
}

.time-filter {
  flex: 1;
}

.time-filter input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.ingredients-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.ingredients-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.ingredients-input button {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 1rem;
  cursor: pointer;
}

.selected-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-ingredient {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #f0f0f0;
  border-radius: 16px;
}

.remove-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.reset-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.reset-btn:hover {
  background-color: #f0f0f0;
}

.recipes-container {
  margin-top: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
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

.no-recipes {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.recipe-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.recipe-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.recipe-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.recipe-content {
  padding: 1.5rem;
}

.recipe-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.recipe-description {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.recipe-tag {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  background-color: #f0f0f0;
  border-radius: 12px;
  font-size: 0.75rem;
}

.recipe-actions {
  display: flex;
  justify-content: center;
}

.view-recipe-btn {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-align: center;
  transition: var(--transition);
}

.view-recipe-btn:hover {
  background-color: #ff5252;
}

@media (max-width: 768px) {
  .time-section {
    flex-direction: column;
    gap: 1rem;
  }

  .recipe-cards {
    grid-template-columns: 1fr;
  }
}
</style>
