<script setup lang="ts">
/**
 * 首页视图组件
 * 功能：展示系统概览、主要功能和热门食谱
 * 包含：欢迎区域、功能卡片展示和热门食谱预览
 */
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
          <h3>智能搜索</h3>
          <p>通过食材、烹饪时间或菜系快速查找食谱</p>
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

    <!-- 热门食谱区域 - 展示系统中的热门食谱 -->
    <section class="popular-recipes">
      <h2 class="section-title">热门食谱</h2>
      <p class="section-description">查看我们社区中最受欢迎的食谱</p>
      <div class="recipes-preview">
        <!-- 这里将来会显示热门食谱 -->
        <div class="recipe-card-placeholder">
          <div class="placeholder-image"></div>
          <div class="placeholder-content">
            <h3>食谱将在这里显示</h3>
            <p>开始添加您的第一个食谱吧！</p>
          </div>
        </div>
      </div>
      <div class="view-more-container">
        <router-link to="/recipes" class="view-more-link">查看全部食谱</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 首页容器样式 */
.home {
  width: 100%;
}

/* 欢迎区域（Hero）样式 */
.hero {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://source.unsplash.com/random/1200x700/?food,cooking') no-repeat center center;
  background-size: cover;
  color: white;
  padding: 5rem 2rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

/* 按钮区域样式 */
.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
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
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.section-description {
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
}

/* 功能卡片区域样式 */
.features {
  margin-bottom: 3rem;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background-color: var(--card-bg-color);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

/* 热门食谱区域样式 */
.popular-recipes {
  margin-bottom: 3rem;
}

.recipes-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* 食谱卡片占位符样式 */
.recipe-card-placeholder {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.recipe-card-placeholder:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.placeholder-image {
  height: 200px;
  background-color: #f0f0f0;
  background-image: linear-gradient(45deg, #f9f9f9 25%, transparent 25%, transparent 75%, #f9f9f9 75%, #f9f9f9), 
                    linear-gradient(45deg, #f9f9f9 25%, transparent 25%, transparent 75%, #f9f9f9 75%, #f9f9f9);
  background-position: 0 0, 10px 10px;
  background-size: 20px 20px;
}

.placeholder-content {
  padding: 1.5rem;
}

.placeholder-content h3 {
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

/* "查看更多"按钮样式 */
.view-more-container {
  text-align: center;
  margin-top: 2rem;
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

/* 响应式布局调整 */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
  }
  
  .recipes-preview {
    grid-template-columns: 1fr;
  }
}
</style>
