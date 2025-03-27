<script setup lang="ts">
/**
 * 食谱列表视图组件
 * 功能：展示所有食谱并提供多条件筛选功能
 * 包含：搜索框、筛选面板和食谱列表展示
 */
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import type { RecipeFilter } from '@/types/recipe'

const recipeStore = useRecipeStore()
const recipes = computed(() => recipeStore.getAllRecipes)

// 筛选条件
const filter = ref<RecipeFilter>({
  search: '',
  category: '',
  tags: [],
  difficulty: undefined,
  maxPrepTime: undefined,
  maxCookTime: undefined,
  ingredients: []
})

// 是否显示筛选面板
const showFilter = ref(false)

// 筛选后的食谱
const filteredRecipes = computed(() => {
  if (!filter.value.search && !filter.value.category && (!filter.value.tags || filter.value.tags.length === 0) &&
      !filter.value.difficulty && filter.value.maxPrepTime === undefined && filter.value.maxCookTime === undefined &&
      (!filter.value.ingredients || filter.value.ingredients.length === 0)) {
    return recipes.value
  }
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
    ingredients: []
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

const toggleFavorite = (id: string) => {
  recipeStore.toggleFavorite(id)
}

// 分类、标签和难度选项 - 用于筛选面板
const categories = recipeStore.categories;
const popularTags = recipeStore.popularTags;
</script>

<template>
  <div class="recipes-page">
    <div class="page-header">
      <h1>浏览食谱</h1>
      <div class="search-bar">
        <input 
          type="text" 
          v-model="filter.search" 
          placeholder="搜索食谱..." 
          class="search-input"
        />
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
            <input 
              type="radio" 
              :value="category" 
              v-model="filter.category" 
              name="category"
            />
            <span>{{ category }}</span>
          </label>
          <label class="category-option">
            <input 
              type="radio" 
              value="" 
              v-model="filter.category" 
              name="category"
            />
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
            :class="['tag', { 'active': filter.tags?.includes(tag) }]"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div class="filter-section">
        <h3>难度</h3>
        <div class="difficulty-options">
          <label class="difficulty-option">
            <input 
              type="radio" 
              value="easy" 
              v-model="filter.difficulty" 
              name="difficulty"
            />
            <span>简单</span>
          </label>
          <label class="difficulty-option">
            <input 
              type="radio" 
              value="medium" 
              v-model="filter.difficulty" 
              name="difficulty"
            />
            <span>中等</span>
          </label>
          <label class="difficulty-option">
            <input 
              type="radio" 
              value="hard" 
              v-model="filter.difficulty" 
              name="difficulty"
            />
            <span>困难</span>
          </label>
          <label class="difficulty-option">
            <input 
              type="radio" 
              :value="undefined" 
              v-model="filter.difficulty" 
              name="difficulty"
            />
            <span>全部</span>
          </label>
        </div>
      </div>
      
      <div class="filter-section time-section">
        <div class="time-filter">
          <h3>最长准备时间（分钟）</h3>
          <input 
            type="number" 
            v-model="filter.maxPrepTime" 
            min="0" 
            placeholder="不限"
          />
        </div>
        
        <div class="time-filter">
          <h3>最长烹饪时间（分钟）</h3>
          <input 
            type="number" 
            v-model="filter.maxCookTime" 
            min="0" 
            placeholder="不限"
          />
        </div>
      </div>
      
      <div class="filter-section">
        <h3>包含的食材</h3>
        <div class="ingredients-input">
          <input 
            type="text" 
            placeholder="输入食材名称"
            @keyup.enter="addIngredient($event)"
          />
          <button @click="addIngredient($event)">添加</button>
        </div>
        <div v-if="filter.ingredients && filter.ingredients.length > 0" class="selected-ingredients">
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
      <div v-if="filteredRecipes.length === 0" class="no-recipes">
        <p>未找到符合条件的食谱</p>
      </div>
      <div v-else class="recipe-cards">
        <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
          <div class="recipe-image" :style="{ backgroundImage: `url(${recipe.imageUrl})` }">
            <button @click="toggleFavorite(recipe.id)" class="favorite-btn">
              <span v-if="recipe.isFavorite">❤️</span>
              <span v-else>🤍</span>
            </button>
          </div>
          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>
            <div class="recipe-meta">
              <span class="prep-time">准备：{{ recipe.prepTime }}分钟</span>
              <span class="cook-time">烹饪：{{ recipe.cookTime }}分钟</span>
            </div>
            <div class="recipe-tags">
              <span v-for="tag in recipe.tags" :key="tag" class="recipe-tag">{{ tag }}</span>
            </div>
            <div class="recipe-actions">
              <router-link :to="`/recipe/${recipe.id}`" class="view-recipe-btn">查看详情</router-link>
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

.category-options, .difficulty-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.category-option, .difficulty-option {
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

.recipe-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.favorite-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
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