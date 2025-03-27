/**
 * 食谱状态管理模块
 * 使用Pinia管理食谱数据，包括食谱的CRUD操作、收藏管理和搜索过滤等功能
 * 数据持久化使用LocalStorage实现
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Recipe, RecipeFilter } from '@/types/recipe'
import { v4 as uuidv4 } from 'uuid'

export const useRecipeStore = defineStore('recipe', () => {
  // 状态定义 - 应用的核心数据
  const recipes = ref<Recipe[]>([])               // 所有食谱列表
  const favoriteRecipes = ref<string[]>([])       // 收藏的食谱ID列表
  const categories = ref<string[]>(['早餐', '午餐', '晚餐', '甜点', '小吃', '汤品', '主食', '沙拉'])  // 预定义食谱分类
  const popularTags = ref<string[]>(['快手菜', '家常菜', '低脂', '高蛋白', '素食', '辣', '甜', '酸'])  // 预定义食谱标签
  
  // 获取器 - 定义计算属性和过滤方法
  
  /**
   * 获取所有食谱
   * @returns 完整的食谱列表
   */
  const getAllRecipes = computed(() => recipes.value)
  
  /**
   * 获取收藏的食谱
   * @returns 用户收藏的食谱列表
   */
  const getFavoriteRecipes = computed(() => {
    return recipes.value.filter(recipe => favoriteRecipes.value.includes(recipe.id))
  })
  
  /**
   * 获取推荐的食谱（随机选择几个）
   * @returns 随机选择的食谱作为推荐
   */
  const getRecommendedRecipes = computed(() => {
    const shuffled = [...recipes.value].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(4, shuffled.length))
  })
  
  /**
   * 按照过滤条件筛选食谱
   * @param filter 筛选条件对象
   * @returns 符合条件的食谱列表
   */
  const getFilteredRecipes = (filter: RecipeFilter) => {
    return recipes.value.filter(recipe => {
      // 按照标题或描述搜索
      if (filter.search && !recipe.title.toLowerCase().includes(filter.search.toLowerCase()) && 
          !recipe.description.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }
      
      // 按照分类筛选
      if (filter.category && recipe.category !== filter.category) {
        return false
      }
      
      // 按照标签筛选
      if (filter.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every(tag => recipe.tags.includes(tag))
        if (!hasAllTags) return false
      }
      
      // 按照难度筛选
      if (filter.difficulty && recipe.difficulty !== filter.difficulty) {
        return false
      }
      
      // 按照准备时间筛选
      if (filter.maxPrepTime !== undefined && recipe.prepTime > filter.maxPrepTime) {
        return false
      }
      
      // 按照烹饪时间筛选
      if (filter.maxCookTime !== undefined && recipe.cookTime > filter.maxCookTime) {
        return false
      }
      
      // 按照材料筛选
      if (filter.ingredients && filter.ingredients.length > 0) {
        const recipeIngredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase())
        const hasAllIngredients = filter.ingredients.every(ingName => 
          recipeIngredientNames.some(name => name.includes(ingName.toLowerCase()))
        )
        if (!hasAllIngredients) return false
      }
      
      return true
    })
  }
  
  // 动作方法 - 定义修改状态的函数
  
  /**
   * 添加新食谱
   * @param recipeData 食谱数据（不包含id、创建时间等自动生成的字段）
   * @returns 新创建的食谱ID
   */
  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false
    }
    
    recipes.value.push(newRecipe)
    saveRecipesToLocalStorage()
    return newRecipe.id
  }
  
  /**
   * 更新现有食谱
   * @param id 食谱ID
   * @param recipeData 要更新的食谱数据
   * @returns 是否更新成功
   */
  const updateRecipe = (id: string, recipeData: Partial<Recipe>) => {
    const index = recipes.value.findIndex(recipe => recipe.id === id)
    if (index !== -1) {
      recipes.value[index] = {
        ...recipes.value[index],
        ...recipeData,
        updatedAt: new Date().toISOString()
      }
      saveRecipesToLocalStorage()
      return true
    }
    return false
  }
  
  /**
   * 删除食谱
   * @param id 要删除的食谱ID
   * @returns 是否删除成功
   */
  const deleteRecipe = (id: string) => {
    const index = recipes.value.findIndex(recipe => recipe.id === id)
    if (index !== -1) {
      recipes.value.splice(index, 1)
      
      // 如果在收藏列表中，也要移除
      const favIndex = favoriteRecipes.value.indexOf(id)
      if (favIndex !== -1) {
        favoriteRecipes.value.splice(favIndex, 1)
      }
      
      saveRecipesToLocalStorage()
      return true
    }
    return false
  }
  
  /**
   * 切换食谱的收藏状态
   * @param id 食谱ID
   */
  const toggleFavorite = (id: string) => {
    const index = favoriteRecipes.value.indexOf(id)
    if (index === -1) {
      favoriteRecipes.value.push(id)
    } else {
      favoriteRecipes.value.splice(index, 1)
    }
    
    // 更新食谱的isFavorite状态
    const recipeIndex = recipes.value.findIndex(recipe => recipe.id === id)
    if (recipeIndex !== -1) {
      recipes.value[recipeIndex].isFavorite = !recipes.value[recipeIndex].isFavorite
    }
    
    saveRecipesToLocalStorage()
  }
  
  // 数据持久化方法
  
  /**
   * 从本地存储加载食谱数据
   */
  const loadRecipesFromLocalStorage = () => {
    const storedRecipes = localStorage.getItem('recipes')
    const storedFavorites = localStorage.getItem('favoriteRecipes')
    
    if (storedRecipes) {
      recipes.value = JSON.parse(storedRecipes)
    }
    
    if (storedFavorites) {
      favoriteRecipes.value = JSON.parse(storedFavorites)
    }
  }
  
  /**
   * 保存食谱数据到本地存储
   */
  const saveRecipesToLocalStorage = () => {
    localStorage.setItem('recipes', JSON.stringify(recipes.value))
    localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes.value))
  }
  
  /**
   * 初始化加载食谱数据，如果没有则添加示例食谱
   */
  const initialize = () => {
    loadRecipesFromLocalStorage()
    
    // 如果没有食谱数据，可以添加一些示例食谱
    if (recipes.value.length === 0) {
      addSampleRecipes()
    }
  }
  
  /**
   * 添加示例食谱数据
   */
  const addSampleRecipes = () => {
    // 示例食谱1 - 番茄炒蛋
    addRecipe({
      title: '番茄炒蛋',
      description: '简单易做的家常菜，酸甜可口，营养丰富。',
      imageUrl: 'https://source.unsplash.com/random/300x200/?tomato-egg',
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      difficulty: 'easy',
      tags: ['快手菜', '家常菜', '低脂'],
      category: '主食',
      ingredients: [
        { id: uuidv4(), name: '鸡蛋', amount: '3', unit: '个' },
        { id: uuidv4(), name: '番茄', amount: '2', unit: '个' },
        { id: uuidv4(), name: '盐', amount: '1/4', unit: '茶匙' },
        { id: uuidv4(), name: '糖', amount: '1/2', unit: '茶匙' },
        { id: uuidv4(), name: '食用油', amount: '2', unit: '汤匙' },
        { id: uuidv4(), name: '葱花', amount: '适量', unit: '' }
      ],
      steps: [
        { id: uuidv4(), description: '将鸡蛋打散，加入少许盐搅拌均匀' },
        { id: uuidv4(), description: '番茄洗净切块' },
        { id: uuidv4(), description: '热油锅，倒入蛋液，炒至凝固成块，盛出备用' },
        { id: uuidv4(), description: '锅中加油，放入番茄块翻炒，加入适量糖' },
        { id: uuidv4(), description: '番茄炒软出汁后，放入炒好的鸡蛋，大火翻炒均匀' },
        { id: uuidv4(), description: '最后撒上葱花即可出锅' }
      ],
      nutrition: {
        calories: 280,
        protein: 15,
        carbs: 8,
        fat: 22
      },
      author: '系统'
    })
    
    // 示例食谱2 - 香煎三文鱼
    addRecipe({
      title: '香煎三文鱼',
      description: '简单又营养的三文鱼料理，皮酥肉嫩，富含omega-3脂肪酸。',
      imageUrl: 'https://source.unsplash.com/random/300x200/?salmon',
      prepTime: 5,
      cookTime: 15,
      servings: 2,
      difficulty: 'medium',
      tags: ['高蛋白', '低碳水', '海鲜'],
      category: '主食',
      ingredients: [
        { id: uuidv4(), name: '三文鱼排', amount: '2', unit: '片' },
        { id: uuidv4(), name: '盐', amount: '1/2', unit: '茶匙' },
        { id: uuidv4(), name: '黑胡椒', amount: '1/4', unit: '茶匙' },
        { id: uuidv4(), name: '橄榄油', amount: '1', unit: '汤匙' },
        { id: uuidv4(), name: '柠檬', amount: '1/2', unit: '个' },
        { id: uuidv4(), name: '迷迭香', amount: '2', unit: '枝' }
      ],
      steps: [
        { id: uuidv4(), description: '三文鱼用厨房纸擦干水分，两面撒上盐和黑胡椒' },
        { id: uuidv4(), description: '平底锅中倒入橄榄油，中高火加热' },
        { id: uuidv4(), description: '放入三文鱼，皮朝下煎3-4分钟至酥脆' },
        { id: uuidv4(), description: '翻面再煎2-3分钟，放入迷迭香增香' },
        { id: uuidv4(), description: '出锅前挤上柠檬汁提味' },
        { id: uuidv4(), description: '盛盘，可搭配蔬菜或沙拉一起食用' }
      ],
      nutrition: {
        calories: 350,
        protein: 34,
        carbs: 2,
        fat: 24,
        omega3: 1.5
      },
      author: '系统'
    })
    
    saveRecipesToLocalStorage()
  }
  
  // 初始化状态
  initialize()
  
  // 返回状态和方法供组件使用
  return {
    recipes,
    favoriteRecipes,
    categories,
    popularTags,
    getAllRecipes,
    getFavoriteRecipes,
    getRecommendedRecipes,
    getFilteredRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite
  }
}) 