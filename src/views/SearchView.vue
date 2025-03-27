<script setup lang="ts">
/**
 * 搜索视图组件
 * 功能：提供智能搜索功能，展示搜索结果和推荐内容
 * 包含：搜索框、热门标签、搜索结果列表和推荐食谱
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import type { RecipeFilter } from '@/types/recipe'

const router = useRouter()
const recipeStore = useRecipeStore()

// 搜索词
const searchQuery = ref('')
// 搜索结果
const searchResults = ref([])
// 是否正在搜索
const isSearching = ref(false)
// 推荐的食谱
const recommendedRecipes = computed(() => recipeStore.getRecommendedRecipes)
// 热门标签
const popularTags = computed(() => recipeStore.popularTags)

// 执行搜索
/**
 * 执行搜索
 * 根据关键词搜索匹配的食谱
 */
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  
  // 构建搜索过滤条件
  const filter: RecipeFilter = {
    search: searchQuery.value
  }
  
  // 执行搜索
  searchResults.value = recipeStore.getFilteredRecipes(filter)
  
  isSearching.value = false
}

// 监听搜索关键词变化
/**
 * 监听搜索关键词变化，自动执行搜索
 */
watch(searchQuery, () => {
  if (searchQuery.value.trim()) {
    performSearch()
  } else {
    searchResults.value = []
  }
})

// 按标签搜索
/**
 * 按标签搜索
 * @param tag 要搜索的标签
 */
const searchByTag = (tag: string) => {
  searchQuery.value = tag
  performSearch()
}

// 查看食谱详情
/**
 * 跳转到食谱详情页
 * @param id 食谱ID
 */
const viewRecipe = (id: string) => {
  router.push(`/recipe/${id}`)
}

// 切换收藏状态
const toggleFavorite = (id: string) => {
  recipeStore.toggleFavorite(id)
}

// 按食材搜索
/**
 * 按食材搜索
 * @param ingredient 要搜索的食材
 */
const searchByIngredient = (ingredient: string) => {
  searchQuery.value = ingredient
  performSearch()
}

// 智能推荐的主料（这里简单实现为常见食材）
const suggestedIngredients = [
  '鸡肉', '牛肉', '猪肉', '鱼', '虾', '蛋', '豆腐', 
  '米饭', '面条', '土豆', '胡萝卜', '西红柿', '洋葱'
]

// 页面初始化时执行
onMounted(() => {
  // 从URL参数中获取搜索词
  const urlParams = new URLSearchParams(window.location.search)
  const q = urlParams.get('q')
  
  if (q) {
    searchQuery.value = q
    performSearch()
  }
})
</script>

<template>
  <div class="search-page">
    <h1>寻找你的味道</h1>
    
    <div class="search-container">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索食谱名称、描述或食材..." 
          @keyup.enter="performSearch"
          class="search-input"
        />
        <button @click="performSearch" class="search-button">搜索</button>
      </div>
      
      <div class="popular-tags">
        <h3>热门标签</h3>
        <div class="tags-container">
          <span 
            v-for="tag in popularTags" 
            :key="tag" 
            @click="searchByTag(tag)"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div class="popular-ingredients">
        <h3>按主料搜索</h3>
        <div class="ingredients-container">
          <span 
            v-for="ingredient in suggestedIngredients" 
            :key="ingredient"
            @click="searchByIngredient(ingredient)"
            class="ingredient"
          >
            {{ ingredient }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="isSearching" class="loading">
      <p>搜索中...</p>
    </div>
    
    <div v-else-if="searchQuery.trim() && searchResults.length === 0" class="no-results">
      <p>未找到符合 "{{ searchQuery }}" 的食谱</p>
      <p>尝试使用不同的关键词或浏览下方的推荐食谱</p>
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results">
      <h2>搜索结果</h2>
      <div class="recipe-cards">
        <div v-for="recipe in searchResults" :key="recipe.id" class="recipe-card">
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
              <button @click="viewRecipe(recipe.id)" class="view-recipe-btn">查看详情</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!searchQuery.trim() || searchResults.length === 0" class="recommended-recipes">
      <h2>推荐食谱</h2>
      <div class="recipe-cards">
        <div v-for="recipe in recommendedRecipes" :key="recipe.id" class="recipe-card">
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
              <button @click="viewRecipe(recipe.id)" class="view-recipe-btn">查看详情</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-color);
}

.search-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 2rem;
  margin-bottom: 3rem;
}

.search-bar {
  display: flex;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid var(--border-color);
  border-radius: 4px 0 0 4px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-button {
  background-color: var(--primary-color);
  color: white;
  font-size: 1.1rem;
  padding: 0 2rem;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: var(--transition);
}

.search-button:hover {
  background-color: #ff5252;
}

.popular-tags, .popular-ingredients {
  margin-bottom: 1.5rem;
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
  font-size: 1.1rem;
}

.tags-container, .ingredients-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag, .ingredient {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.tag:hover, .ingredient:hover {
  background-color: var(--secondary-color);
  color: white;
}

.loading, .no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.search-results, .recommended-recipes {
  margin-bottom: 3rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 1.5rem;
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
  border: none;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-align: center;
  transition: var(--transition);
  cursor: pointer;
}

.view-recipe-btn:hover {
  background-color: #ff5252;
}

@media (max-width: 768px) {
  .search-container {
    padding: 1.5rem;
  }
  
  .search-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-input {
    border-radius: 4px;
    width: 100%;
  }
  
  .search-button {
    border-radius: 4px;
    width: 100%;
    padding: 0.75rem;
  }
  
  .recipe-cards {
    grid-template-columns: 1fr;
  }
}
</style> 