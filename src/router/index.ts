import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录和注册页面
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    // 用户资料页面
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    // 原有路由
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: () => import('../views/RecipesView.vue'),
    },
    {
      path: '/my-recipes',
      name: 'my-recipes',
      component: () => import('../views/MyRecipesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/recipe/:id',
      name: 'recipe-detail',
      component: () => import('../views/RecipeDetailView.vue'),
    },
    {
      path: '/add-recipe',
      name: 'add-recipe',
      component: () => import('../views/AddRecipeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/edit-recipe/:id',
      name: 'edit-recipe',
      component: () => import('../views/EditRecipeView.vue'),
      meta: { requiresAuth: true },
    },
    // 404页面 - 需要放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  console.log('路由导航: 从', from.path, '到', to.path, '参数:', to.params)

  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn

  // 初始化用户存储
  await userStore.initialize()
  console.log('用户登录状态:', isLoggedIn ? '已登录' : '未登录')

  // 需要登录的页面
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('需要登录的页面，但用户未登录，重定向到登录页')
    // 重定向到登录页面并传递原目标路径
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // 已登录用户访问仅限游客页面（如登录页）
  else if (to.meta.requiresGuest && isLoggedIn) {
    console.log('已登录用户访问仅限游客页面，重定向到首页')
    next({ name: 'home' })
  }
  // 其他情况正常访问
  else {
    console.log('正常导航到', to.path)
    next()
  }
})

export default router
