<script setup lang="ts">
/**
 * 关于页面视图组件
 * 功能：介绍美味食谱管理系统的背景、功能特性、技术实现和联系方式
 * 包含：项目介绍、功能列表、技术栈说明和联系信息
 */
</script>

<template>
  <div class="about-page">
    <h1>关于美味食谱管理系统</h1>
    
    <div class="about-content">
      <section class="about-section">
        <h2>项目介绍</h2>
        <p>美味食谱管理系统是一个帮助烹饪爱好者记录、发现和分享美食的平台。无论您是烹饪新手还是经验丰富的主厨，本系统都能帮助您将食谱整理得井井有条，并通过智能推荐功能发现适合自己的新食谱。</p>
        <p>该系统旨在提供一个直观、易用的界面，让用户能够轻松管理自己的食谱收藏，按照不同的分类、标签进行筛选，并探索新的烹饪灵感。</p>
      </section>
      
      <section class="about-section">
        <h2>核心功能</h2>
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">📝</div>
            <div class="feature-content">
              <h3>食谱记录和管理</h3>
              <p>创建和编辑详细的食谱，包括食材、步骤、准备时间和烹饪时间等信息。您可以根据需要随时调整食谱内容。</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">🔍</div>
            <div class="feature-content">
              <h3>智能搜索</h3>
              <p>通过食谱名称、描述、食材或标签快速查找特定食谱。我们的搜索功能支持多种筛选条件，帮助您找到最符合需求的菜品。</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">✨</div>
            <div class="feature-content">
              <h3>个性化推荐</h3>
              <p>基于您的浏览历史和收藏习惯，系统会为您推荐可能感兴趣的食谱，让您发现更多美食灵感。</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">❤️</div>
            <div class="feature-content">
              <h3>收藏功能</h3>
              <p>将喜爱的食谱添加到收藏夹，方便随时查看和烹饪。您可以创建自己的食谱收藏集，分类管理不同类型的菜品。</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <div class="feature-content">
              <h3>营养信息</h3>
              <p>查看食谱的详细营养成分，包括热量、蛋白质、碳水化合物和脂肪含量，帮助您进行健康饮食规划。</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">🖨️</div>
            <div class="feature-content">
              <h3>打印和分享</h3>
              <p>一键打印食谱或通过链接分享给朋友和家人。让美食体验不再局限于个人，而是成为社交活动的一部分。</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="about-section">
        <h2>技术实现</h2>
        <p>本系统采用现代前端技术栈构建，确保性能优良和用户体验：</p>
        <ul class="tech-list">
          <li><strong>前端框架：</strong> Vue 3 + TypeScript</li>
          <li><strong>状态管理：</strong> Pinia</li>
          <li><strong>路由管理：</strong> Vue Router</li>
          <li><strong>存储方式：</strong> 本地存储 (LocalStorage)</li>
          <li><strong>UI设计：</strong> 自定义CSS，响应式设计</li>
        </ul>
      </section>
      
      <section class="about-section">
        <h2>联系我们</h2>
        <p>如有任何问题、建议或反馈，请通过以下方式联系我们：</p>
        <div class="contact-info">
          <p><strong>邮箱：</strong> contact@recipesystem.com</p>
          <p><strong>GitHub：</strong> <a href="https://github.com/username/recipe-management-system" target="_blank">github.com/username/recipe-management-system</a></p>
          <p><strong>微信公众号：</strong> 美味食谱管理</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-color);
}

.about-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 2rem;
}

.about-section {
  margin-bottom: 3rem;
}

.about-section:last-child {
  margin-bottom: 0;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  font-size: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

p {
  line-height: 1.6;
  color: var(--text-color);
  margin: 0 0 1rem 0;
}

.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.feature-icon {
  font-size: 2rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.feature-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 1.1rem;
}

.feature-content p {
  margin: 0;
  font-size: 0.95rem;
}

.tech-list {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.tech-list li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.contact-info {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.contact-info p {
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .about-content {
    padding: 1.5rem;
  }
  
  .features-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
