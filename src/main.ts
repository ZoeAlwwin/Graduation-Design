import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useRecipeStore } from './stores/recipe'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化食谱数据
const recipeStore = useRecipeStore()
recipeStore.initialize()

// 初始化用户数据
const userStore = useUserStore()
userStore.initialize()

app.mount('#app')
