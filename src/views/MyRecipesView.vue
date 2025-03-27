<script setup lang="ts">
/**
 * 我的食谱视图组件
 * 功能：展示用户收藏的食谱和用户创建的食谱
 * 包含：标签页切换、食谱卡片列表、收藏管理和删除功能
 */
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipe'

const recipeStore = useRecipeStore()

// 收藏的食谱
const favoriteRecipes = computed(() => recipeStore.getFavoriteRecipes.value)

// 用户创建的食谱计算属性 (作者为当前用户)
const userRecipes = computed(() => {
  // 当前简化版本中假设用户名为"我"，实际应用中应从用户系统获取
  return recipeStore.getAllRecipes.value.filter(recipe => recipe.author === '我')
})

// 当前显示的标签页（收藏/我的创建）
const activeTab = ref('favorites')

// 切换标签页
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

// 取消收藏
const toggleFavorite = (id: string) => {
  recipeStore.toggleFavorite(id)
}

// 删除食谱
const confirmDelete = (id: string) => {
  if (confirm('确定要删除这个食谱吗？此操作不可恢复。')) {
    recipeStore.deleteRecipe(id)
  }
}
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
      <div v-if="favoriteRecipes.length === 0" class="empty-state">
        <p>还没有收藏任何食谱</p>
        <router-link to="/recipes" class="action-link">浏览食谱</router-link>
      </div>
      
      <div v-else class="recipe-cards">
        <div v-for="recipe in favoriteRecipes" :key="recipe.id" class="recipe-card">
          <div 
            class="recipe-image"
            :style="{ backgroundImage: `url(${recipe.imageUrl || 'https://source.unsplash.com/random/300x200/?food'})` }"
          ></div>
          
          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>
            
            <div class="recipe-meta">
              <span title="准备时间"><i class="meta-icon">⏱️</i> {{ recipe.prepTime }} 分钟</span>
              <span title="烹饪时间"><i class="meta-icon">🍳</i> {{ recipe.cookTime }} 分钟</span>
            </div>
            
            <div class="recipe-tags">
              <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              <span v-if="recipe.tags.length > 3" class="tag more-tag">+{{ recipe.tags.length - 3 }}</span>
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
      <div class="tab-header">
        <router-link to="/add-recipe" class="add-recipe-button">
          <i class="add-icon">+</i> 添加新食谱
        </router-link>
      </div>
      
      <div v-if="userRecipes.length === 0" class="empty-state">
        <p>您还没有创建任何食谱</p>
        <router-link to="/add-recipe" class="action-link">创建第一个食谱</router-link>
      </div>
      
      <div v-else class="recipe-cards">
        <div v-for="recipe in userRecipes" :key="recipe.id" class="recipe-card">
          <div 
            class="recipe-image"
            :style="{ backgroundImage: `url(${recipe.imageUrl || 'https://source.unsplash.com/random/300x200/?food'})` }"
          ></div>
          
          <div class="recipe-content">
            <h3>{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>
            
            <div class="recipe-meta">
              <span title="准备时间"><i class="meta-icon">⏱️</i> {{ recipe.prepTime }} 分钟</span>
              <span title="烹饪时间"><i class="meta-icon">🍳</i> {{ recipe.cookTime }} 分钟</span>
            </div>
            
            <div class="recipe-tags">
              <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
              <span v-if="recipe.tags.length > 3" class="tag more-tag">+{{ recipe.tags.length - 3 }}</span>
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
  transition: var(--transition);
}

.action-link:hover {
  background-color: #ff5252;
}

/* 食谱卡片列表样式 */
.recipe-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

/* 食谱卡片样式 */
.recipe-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: var(--transition);
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  height: 180px;
  background-size: cover;
  background-position: center;
}

.recipe-content {
  padding: 1.5rem;
}

.recipe-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.recipe-description {
  color: #666;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.95rem;
}

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

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  background-color: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}

.more-tag {
  background-color: #e0e0e0;
}

/* 操作按钮样式 */
.recipe-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.view-button {
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
}

.view-button:hover {
  background-color: #ff5252;
}

.edit-button {
  background-color: #4caf50;
  color: white;
  text-decoration: none;
}

.edit-button:hover {
  background-color: #45a049;
}

.favorite-button {
  background-color: #ff9800;
  color: white;
}

.favorite-button:hover {
  background-color: #f57c00;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.delete-button:hover {
  background-color: #e53935;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tab-content {
    padding: 1.5rem;
  }
  
  .recipe-cards {
    grid-template-columns: 1fr;
  }
  
  .recipe-actions {
    flex-wrap: wrap;
  }
  
  .action-button {
    flex: 1;
    text-align: center;
  }
}
</style> 