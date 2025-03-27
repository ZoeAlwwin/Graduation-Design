<script setup lang="ts">
/**
 * 主应用组件
 * 这是应用程序的根组件，包含整体布局结构（头部导航、主内容区和页脚）
 * 所有页面都将在这个组件内进行渲染
 */
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <!-- 头部导航区域 -->
    <header>
      <div class="logo-container">
        <h1 class="site-title">美味食谱管理</h1>
      </div>

      <!-- 主导航菜单 -->
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/recipes">食谱浏览</RouterLink>
        <RouterLink to="/my-recipes">我的食谱</RouterLink>
        <RouterLink to="/add-recipe">添加食谱</RouterLink>
        <RouterLink to="/search">搜索</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </header>

    <!-- 主内容区域 - 路由视图将在这里渲染 -->
    <main>
      <RouterView />
    </main>

    <!-- 页脚区域 -->
    <footer>
      <p>© 2024 美味食谱管理系统 | 享受烹饪的乐趣</p>
    </footer>
  </div>
</template>

<style>
/* 全局CSS变量定义，用于统一色彩和样式主题 */
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  --accent-color: #ffd166;
  --text-color: #2f3542;
  --light-bg-color: #f9f7f7;
  --card-bg-color: #ffffff;
  --border-color: #e8e8e8;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* 全局重置样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 基础页面样式 */
body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--light-bg-color);
  line-height: 1.6;
}

/* 应用容器布局 - 使用flex实现最小高度占满视口 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 头部导航样式 */
header {
  background-color: white;
  box-shadow: var(--shadow);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  color: var(--primary-color);
  font-weight: 700;
}

/* 导航菜单样式 */
nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: var(--transition);
}

nav a:hover {
  color: var(--primary-color);
}

/* 活动路由链接样式 */
nav a.router-link-active {
  color: var(--primary-color);
}

nav a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

/* 主内容区域样式 */
main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* 页脚样式 */
footer {
  background-color: white;
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  header {
    flex-direction: column;
    padding: 1rem;
  }
  
  nav {
    margin-top: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .site-title {
    margin-bottom: 0.5rem;
  }
}
</style>
