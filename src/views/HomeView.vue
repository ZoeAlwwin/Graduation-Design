<script setup lang="ts">
/**
 * 首页视图组件
 * 功能：展示系统概览、主要功能和热门食谱
 * 包含：欢迎区域、功能卡片展示和热门食谱预览
 */
import { ref, onMounted } from 'vue'
import { useRecipeStore } from '../stores/recipe'
import type { Recipe } from '../types/recipe'
import { useRouter } from 'vue-router'

const router = useRouter()

// 添加 Font Awesome 样式
const addFontAwesome = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
  document.head.appendChild(link)
}

const recipeStore = useRecipeStore()
const popularRecipes = ref<Recipe[]>([])

// 获取热门食谱
const fetchPopularRecipes = async () => {
  try {
    // 获取所有食谱
    await recipeStore.fetchAllRecipes()
    // 按收藏数排序并获取前6个
    popularRecipes.value = [...recipeStore.recipes]
      .sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0))
      .slice(0, 6)
  } catch (error) {
    console.error('获取热门食谱失败:', error)
  }
}

// 添加查看食谱详情方法
const viewRecipe = (id: string) => {
  console.log('点击食谱:', id)
  if (id) {
    router.push({
      name: 'recipe-detail',
      params: { id },
    })
  }
}

// 组件挂载时获取热门食谱
onMounted(() => {
  addFontAwesome()
  fetchPopularRecipes()
})
</script>

<template>
  <div class="home">
    <!-- 欢迎区域（Hero部分）- 展示系统标题和主要行动按钮 -->
    <section class="hero">
      <div class="hero-content">
        <h1>欢迎使用美味食谱管理系统</h1>
        <p>记录、发现和分享您最喜爱的食谱</p>
        <div class="hero-buttons">
          <router-link to="/recipes" class="btn btn-primary">浏览食谱</router-link>
          <router-link to="/add-recipe" class="btn btn-secondary">添加食谱</router-link>
        </div>
      </div>
    </section>

    <!-- 内容容器 - 用于在大屏幕上控制内容宽度 -->
    <div class="content-container">
      <!-- 功能介绍区域 - 展示系统的主要功能特点 -->
      <section class="features">
        <h2 class="section-title">主要功能</h2>
        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>食谱记录和管理</h3>
            <p>轻松创建、编辑和组织您的食谱收藏，包括材料、步骤和烹饪时间</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>智能筛选</h3>
            <p>通过分类、标签、难度等多维度筛选食谱</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✨</div>
            <h3>个性化推荐</h3>
            <p>根据您的口味偏好和历史浏览获取食谱推荐</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>营养信息</h3>
            <p>查看详细的营养成分和摄入量信息</p>
          </div>
        </div>
      </section>

      <!-- 大屏幕增强布局-两栏结构 -->
      <div class="two-column-layout">
        <!-- 热门食谱区域 - 展示系统中的热门食谱 -->
        <section class="popular-recipes">
          <h2 class="section-title">热门食谱</h2>
          <p class="section-description">查看我们社区中最受欢迎的食谱</p>
          <div class="recipes-preview">
            <div
              v-for="recipe in popularRecipes"
              :key="recipe.id"
              class="recipe-card"
              @click="viewRecipe(recipe.id)"
            >
              <div class="recipe-image" :style="{ backgroundImage: `url(${recipe.image})` }"></div>
              <div class="recipe-content">
                <h3>{{ recipe.title }}</h3>
                <p>{{ recipe.description }}</p>
                <div class="recipe-meta">
                  <span class="favorite-count">
                    <i class="fa-solid fa-heart"></i> {{ recipe.favoriteCount || 0 }}
                  </span>
                  <span class="cook-time">
                    <i class="fa-solid fa-clock"></i> {{ recipe.cookTime }}分钟
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="view-more-container">
            <router-link to="/recipes" class="view-more-link">查看全部食谱</router-link>
          </div>
        </section>

        <!-- 季节推荐区域 - 新增区域利用大屏空间 -->
        <section class="seasonal-recipes">
          <h2 class="section-title">季节推荐</h2>
          <p class="section-description">当季食材制作的美味食谱</p>
          <div class="seasonal-content">
            <div class="seasonal-highlight">
              <div class="seasonal-image"></div>
              <div class="seasonal-info">
                <h3>春季特选</h3>
                <p>利用新鲜春笋、菠菜和草莓等春季食材，制作出富有季节特色的菜肴</p>
                <ul class="seasonal-tags">
                  <li>清新</li>
                  <li>营养</li>
                  <li>时令</li>
                </ul>
                <router-link to="/recipes?season=spring" class="btn btn-small"
                  >查看春季食谱</router-link
                >
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 烹饪技巧区域 -  -->
      <section class="cooking-tips">
        <h2 class="section-title">烹饪小贴士</h2>
        <div class="tips-container">
          <div class="tip-card">
            <div class="tip-icon">🍳</div>
            <h3>完美煎蛋技巧</h3>
            <p>使用中小火，加入少许水并盖上锅盖，可让蛋黄保持半熟状态</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🔪</div>
            <h3>刀工基础</h3>
            <p>保持刀具锋利，使用正确的握刀姿势，可提高切菜效率和安全性</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🧂</div>
            <h3>调味秘诀</h3>
            <p>先少量添加，逐步调整，烹饪过程中多次品尝以掌握完美口味</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🍚</div>
            <h3>完美煮饭</h3>
            <p>米和水的比例为1:1.2，淘洗后浸泡20分钟，可煮出粒粒分明的米饭</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 首页容器样式 */
.home {
  width: 100%;
}

/* 内容容器 - 控制大屏幕宽度 */
.content-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
}

/* 欢迎区域（Hero）样式 */
.hero {
  background:
    linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('https://source.unsplash.com/random/1200x700/?food,cooking') no-repeat center center;
  background-size: cover;
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
  width: 100%;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(1.8rem, 4vw, 3rem);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero p {
  font-size: clamp(1rem, 2vw, 1.2rem);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 按钮区域样式 */
.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
  cursor: pointer;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: white;
  color: var(--primary-color);
}

.btn-secondary:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

/* 节标题样式 */
.section-title {
  font-size: clamp(1.5rem, 3vw, 1.8rem);
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.section-description {
  margin-bottom: 1.5rem;
  color: #666;
}

/* 功能卡片区域样式 */
.features {
  margin-bottom: 2rem;
  width: 100%;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature-card {
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  text-align: center;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-size: clamp(1.1rem, 2vw, 1.3rem);
}

/* 两栏布局样式 */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* 热门食谱区域样式 */
.popular-recipes,
.seasonal-recipes {
  width: 100%;
}

.recipes-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

/* 食谱卡片样式 */
.recipe-card {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  height: 100%;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.recipe-content {
  padding: 1.2rem;
}

.recipe-content h3 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  font-size: clamp(1.1rem, 2vw, 1.3rem);
}

.recipe-content p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

.favorite-count,
.cook-time {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.favorite-count i {
  color: #ff4444;
}

.cook-time i {
  color: #666;
}

/* "查看更多"按钮样式 */
.view-more-container {
  text-align: right;
  margin-top: 1rem;
}

.view-more-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  transition: var(--transition);
}

.view-more-link:hover {
  background-color: var(--primary-color);
  color: white;
}

/* 季节推荐样式 */
.seasonal-content {
  margin-top: 1.5rem;
}

.seasonal-highlight {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  height: 100%;
}

.seasonal-image {
  height: 200px;
  background:
    linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url('https://source.unsplash.com/random/800x450/?spring,vegetables') no-repeat center center;
  background-size: cover;
}

.seasonal-info {
  padding: 1.5rem;
}

.seasonal-info h3 {
  color: var(--primary-color);
  margin-bottom: 0.8rem;
  font-size: clamp(1.1rem, 2vw, 1.3rem);
}

.seasonal-tags {
  display: flex;
  list-style: none;
  gap: 0.5rem;
  margin: 1rem 0;
}

.seasonal-tags li {
  background-color: #f0f0f0;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* 烹饪技巧样式 */
.cooking-tips {
  margin-bottom: 3rem;
}

.tips-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.tip-card {
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  text-align: center;
}

.tip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.tip-icon {
  font-size: 2.2rem;
  margin-bottom: 1rem;
}

.tip-card h3 {
  margin-bottom: 0.8rem;
  color: var(--primary-color);
  font-size: 1.1rem;
}

/* 响应式布局调整 */
@media (max-width: 480px) {
  .hero {
    padding: 3rem 1rem;
  }

  .content-container {
    padding: 0 0.5rem;
  }

  .feature-cards,
  .recipes-preview,
  .tips-container {
    grid-template-columns: 1fr;
  }

  .view-more-container {
    text-align: center;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .content-container {
    padding: 0 1.5rem;
  }

  .recipes-preview {
    grid-template-columns: repeat(2, 1fr);
  }

  .tips-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .content-container {
    padding: 0 2rem;
  }

  .two-column-layout {
    grid-template-columns: 2fr 1fr;
  }
}

@media (min-width: 1440px) {
  .content-container {
    padding: 0 2.5rem;
  }

  .feature-cards {
    grid-template-columns: repeat(4, 1fr);
  }

  .tips-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1800px) {
  .hero {
    padding: 8rem 2rem;
  }

  .content-container {
    max-width: 1800px;
  }
}
</style>
