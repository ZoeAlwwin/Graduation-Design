import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'
import { useRecipeStore } from './stores/recipe'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
  zIndex: 3000,
})

// 初始化食谱数据
const recipeStore = useRecipeStore()
recipeStore.initialize()

// 初始化用户数据
const userStore = useUserStore()
userStore.initialize()

app.mount('#app')
