<script setup lang="ts">
/**
 * 编辑食谱视图组件
 * 功能：编辑现有食谱
 * 包含：表单输入、食材和步骤管理、标签选择、营养信息编辑等
 */
import { ref, reactive, onMounted, watch } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useRouter, useRoute } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import type { Recipe, Ingredient, CookingStep } from '@/types/recipe'
import { useUserStore } from '@/stores/user'
import { showSuccess, showError } from '@/utils/message'

// 导入Element Plus组件
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElButton,
  ElTag,
  ElDivider,
} from 'element-plus'

const recipeStore = useRecipeStore()
const router = useRouter()
const userStore = useUserStore()
const route = useRoute()

// 当前编辑的食谱ID
const recipeId = ref<string | null>(null)

// 上传文件输入引用
const fileInput = ref<HTMLInputElement | null>(null)

// 加载状态
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  imageFile: null as File | null,
  imagePreview: '',
  prepTime: 0,
  cookTime: 0,
  servings: 1,
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  category: '',
  tags: [] as string[],
  ingredients: [{ id: uuidv4(), name: '', amount: '', unit: '' }] as Ingredient[],
  steps: [{ id: uuidv4(), description: '' }] as CookingStep[],
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  cuisine: '',
})

// 表单验证
const errors = reactive({
  title: '',
  description: '',
  category: '',
  ingredients: [] as string[],
  steps: [] as string[],
  image: '',
})

/**
 * 初始化组件
 * 1. 确保store初始化
 * 2. 加载食谱数据
 */
onMounted(async () => {
  try {
    console.log('EditRecipeView 组件挂载')
    await loadRecipeFromRoute()
  } catch (error) {
    console.error('组件挂载过程中发生错误:', error)
  }
})

/**
 * 监听路由参数变化，当食谱ID变化时重新加载数据
 */
watch(
  () => route.params.id,
  async (newId, oldId) => {
    console.log('路由参数变化:', oldId, '->', newId)
    // 只有在有新ID并且与旧ID不同时才重新加载数据
    // 检查newId存在是为了避免在离开编辑页面时触发
    if (newId && newId !== oldId) {
      await loadRecipeFromRoute()
    }
  },
)

/**
 * 从路由参数加载食谱数据
 */
const loadRecipeFromRoute = async () => {
  // 获取路由参数中的食谱ID
  const id = route.params.id as string
  console.log('从路由获取食谱ID:', id)

  if (!id) {
    console.error('路由参数中没有找到食谱ID')
    showError('未能找到要编辑的食谱')
    router.push('/my-recipes')
    return
  }

  // 重置表单数据
  formData.title = ''
  formData.description = ''
  formData.imageFile = null
  formData.imagePreview = ''
  formData.prepTime = 0
  formData.cookTime = 0
  formData.servings = 1
  formData.difficulty = 'medium'
  formData.category = ''
  formData.tags = []
  formData.ingredients = [{ id: uuidv4(), name: '', amount: '', unit: '' }]
  formData.steps = [{ id: uuidv4(), description: '' }]
  formData.nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  formData.cuisine = ''

  recipeId.value = id
  console.log('设置当前编辑的食谱ID:', recipeId.value)

  // 初始化食谱存储
  try {
    console.log('开始初始化食谱存储')
    recipeStore.resetStore()
    await recipeStore.initialize()
    console.log('食谱存储初始化完成')
  } catch (error) {
    console.error('初始化食谱存储失败:', error)
    // 继续执行，不要中断
  }

  // 加载食谱数据
  try {
    console.log('开始加载食谱数据')
    await loadRecipeData(id)
    console.log('食谱数据加载完成')
  } catch (error) {
    console.error('加载食谱数据失败:', error)
    // 显示错误但不中断执行
    showError('加载食谱数据时发生错误，请尝试刷新页面')
  }

  // 使用validateNumber函数来保证prepTime、cookTime和servings的有效性
  try {
    formData.prepTime = validateNumber(formData.prepTime)
    formData.cookTime = validateNumber(formData.cookTime)
    formData.servings = validateNumber(formData.servings, 1)
  } catch (error) {
    console.error('验证数值失败:', error)
  }
}

/**
 * 加载食谱数据
 * @param id 食谱ID
 */
const loadRecipeData = async (id: string) => {
  console.log('开始loadRecipeData函数, ID:', id)

  if (!id) {
    console.error('ID为空')
    hasError.value = true
    errorMessage.value = '食谱ID无效'
    return
  }

  // 重置状态
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    // 直接从API获取数据
    console.log('准备请求API获取食谱')

    // 尝试获取token
    const token = localStorage.getItem('token')
    console.log('获取到token:', token ? '成功' : '失败')

    // 构建请求
    const requestUrl = `http://localhost:5001/api/recipes/${id}`
    console.log('请求URL:', requestUrl)

    const response = await fetch(requestUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      console.error('API请求失败:', response.status, response.statusText)
      throw new Error(`API请求失败，状态码: ${response.status}`)
    }

    // 获取响应数据
    let responseData
    try {
      responseData = await response.json()
      console.log('API响应数据结构:', Object.keys(responseData))
      console.log('完整API响应数据:', JSON.stringify(responseData, null, 2))
      console.log(
        '食谱数据结构:',
        responseData.data ? Object.keys(responseData.data) : '没有data字段',
      )
      if (responseData.data && responseData.data.author) {
        console.log('作者信息结构:', typeof responseData.data.author, responseData.data.author)
      } else {
        console.log('作者信息不存在或结构异常')
      }
    } catch (error) {
      console.error('解析API响应JSON失败:', error)
      throw new Error('解析API响应失败')
    }

    if (!responseData || !responseData.data) {
      console.error('API响应数据无效:', responseData)
      showError('获取食谱数据失败: 响应数据无效')
      return
    }

    const recipe = responseData.data
    console.log('获取到食谱基本信息 - 标题:', recipe.title, '作者:', recipe.author?.id)

    // 验证获取的数据
    if (!recipe || !recipe.title) {
      console.error('获取到的食谱数据无效')
      showError('获取到的食谱数据无效')
      return
    }

    // 检查当前用户是否是食谱作者
    const currentUserId = userStore.currentUser?.id
    let recipeAuthorId: string | undefined

    // 根据author字段的不同数据结构获取作者ID
    if (recipe.author) {
      if (typeof recipe.author === 'object' && recipe.author.id) {
        // author是对象，包含id字段
        recipeAuthorId = recipe.author.id
        console.log('作者ID来自对象(author.id):', recipeAuthorId)
      } else if (typeof recipe.author === 'object' && recipe.author._id) {
        // MongoDB对象返回格式，包含_id字段
        recipeAuthorId = recipe.author._id
        console.log('作者ID来自MongoDB对象(author._id):', recipeAuthorId)
      } else if (typeof recipe.author === 'string') {
        // author直接是字符串ID
        recipeAuthorId = recipe.author
        console.log('作者ID是字符串:', recipeAuthorId)
      } else if (typeof recipe.author === 'object') {
        // 可能是MongoDB的ObjectId对象格式，尝试提取
        const authorStr = String(recipe.author)
        console.log('作者是复杂对象，字符串表示:', authorStr)

        // 尝试从ObjectId格式中提取ID，如"ObjectId('67e8e4467cbe32ba9da468a0')"
        const idMatch = authorStr.match(/ObjectId\(['"](.*)['"]\)/)
        if (idMatch && idMatch[1]) {
          recipeAuthorId = idMatch[1]
          console.log('从ObjectId提取的作者ID:', recipeAuthorId)
        }
      } else {
        console.warn('作者信息格式异常:', recipe.author)
      }
    } else {
      console.warn('食谱数据中无作者信息')
    }

    console.log('检查权限, 食谱作者ID:', recipeAuthorId, '类型:', typeof recipeAuthorId)
    console.log('当前用户ID:', currentUserId, '类型:', typeof currentUserId)

    // 修改权限逻辑：
    // 1. 如果食谱有作者信息，且与当前用户不匹配，则拒绝访问
    // 2. 如果食谱没有作者信息，则假定允许当前用户编辑
    if (recipeAuthorId && currentUserId && String(recipeAuthorId) !== String(currentUserId)) {
      console.error('权限不足, 作者ID:', recipeAuthorId, '当前用户ID:', currentUserId)
      showError('您没有权限编辑该食谱')
      router.push('/my-recipes')
      return
    }

    // 开始填充表单数据
    console.log('开始填充表单数据')

    // 使用try-catch分别处理每个部分的数据填充，确保一个部分出错不影响其他部分

    // 填充基本信息
    try {
      // 标题和描述
      formData.title = recipe.title || ''
      console.log('设置标题:', formData.title)
      formData.description = recipe.description || ''
      console.log('设置描述:', formData.description)
    } catch (error) {
      console.error('填充基本信息失败:', error)
    }

    // 处理图片URL
    try {
      if (recipe.image) {
        console.log('处理图片URL:', recipe.image.substring(0, 50) + '...')
        // 验证图片URL格式
        if (recipe.image.startsWith('data:image')) {
          formData.imagePreview = recipe.image
          console.log('使用Base64图片')
        } else if (recipe.image.startsWith('http')) {
          formData.imagePreview = recipe.image
          console.log('使用外部URL图片')
        } else {
          console.warn('图片URL格式不明确')
          formData.imagePreview = recipe.image
        }
      } else {
        console.log('食谱没有图片')
        formData.imagePreview = ''
      }
    } catch (error) {
      console.error('处理图片URL失败:', error)
      formData.imagePreview = ''
    }

    // 填充烹饪信息
    try {
      formData.prepTime = recipe.prepTime || 0
      formData.cookTime = recipe.cookTime || 0
      formData.servings = recipe.servings || 1
      formData.difficulty = recipe.difficulty || 'medium'
      console.log('设置烹饪信息: 准备时间', formData.prepTime, '烹饪时间', formData.cookTime)
    } catch (error) {
      console.error('填充烹饪信息失败:', error)
    }

    // 处理分类信息
    try {
      if (Array.isArray(recipe.category) && recipe.category.length > 0) {
        formData.category = recipe.category[0]
        console.log('设置分类(从数组):', formData.category)
      } else if (typeof recipe.category === 'string') {
        formData.category = recipe.category
        console.log('设置分类(从字符串):', formData.category)
      } else {
        formData.category = ''
        console.log('分类为空')
      }

      formData.cuisine = recipe.cuisine || ''
      console.log('设置菜系:', formData.cuisine)
    } catch (error) {
      console.error('处理分类信息失败:', error)
    }

    // 处理标签
    try {
      console.log(
        '处理标签, 原始数据类型:',
        typeof recipe.tags,
        Array.isArray(recipe.tags) ? '是数组' : '不是数组',
      )
      if (Array.isArray(recipe.tags)) {
        formData.tags = [...recipe.tags]
        console.log('设置标签(数组):', formData.tags)
      } else {
        formData.tags = []
        console.log('标签设为空数组')
      }
    } catch (error) {
      console.error('处理标签失败:', error)
      formData.tags = []
    }

    // 处理食材
    try {
      console.log(
        '处理食材, 原始数据:',
        typeof recipe.ingredients,
        Array.isArray(recipe.ingredients) ? recipe.ingredients.length + '个食材' : '不是数组',
      )
      formData.ingredients = []

      if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
        recipe.ingredients.forEach((ingredient: string, index: number) => {
          try {
            console.log(`处理第${index + 1}个食材:`, ingredient)
            const parts = String(ingredient).split(' ')
            let name = parts[0] || ''
            const amount = parts[1] || ''
            const unit = parts.slice(2).join(' ') || ''

            if (!name && parts.length > 0) {
              name = parts.join(' ')
            }

            formData.ingredients.push({
              id: uuidv4(),
              name,
              amount,
              unit,
            })
          } catch (e) {
            console.error(`处理第${index + 1}个食材出错:`, e)
          }
        })
      }

      // 确保至少有一个食材
      if (formData.ingredients.length === 0) {
        formData.ingredients = [{ id: uuidv4(), name: '', amount: '', unit: '' }]
        console.log('添加默认空白食材')
      }

      console.log('最终食材数量:', formData.ingredients.length)
    } catch (error) {
      console.error('处理食材失败:', error)
      formData.ingredients = [{ id: uuidv4(), name: '', amount: '', unit: '' }]
    }

    // 处理步骤
    try {
      console.log(
        '处理步骤, 原始数据:',
        typeof recipe.steps,
        Array.isArray(recipe.steps) ? recipe.steps.length + '个步骤' : '不是数组',
      )
      formData.steps = []

      if (Array.isArray(recipe.steps) && recipe.steps.length > 0) {
        recipe.steps.forEach((step: string, index: number) => {
          try {
            formData.steps.push({
              id: uuidv4(),
              description: String(step),
            })
          } catch (e) {
            console.error(`处理第${index + 1}个步骤出错:`, e)
          }
        })
      }

      // 确保至少有一个步骤
      if (formData.steps.length === 0) {
        formData.steps = [{ id: uuidv4(), description: '' }]
        console.log('添加默认空白步骤')
      }

      console.log('最终步骤数量:', formData.steps.length)
    } catch (error) {
      console.error('处理步骤失败:', error)
      formData.steps = [{ id: uuidv4(), description: '' }]
    }

    // 处理营养信息
    try {
      if (recipe.nutrition) {
        formData.nutrition = {
          calories: recipe.nutrition.calories || 0,
          protein: recipe.nutrition.protein || 0,
          carbs: recipe.nutrition.carbs || 0,
          fat: recipe.nutrition.fat || 0,
        }
        console.log('设置营养信息')
      } else {
        console.log('没有营养信息数据')
      }
    } catch (error) {
      console.error('处理营养信息失败:', error)
      formData.nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    console.log('食谱数据全部加载完成')
  } catch (error) {
    console.error('加载食谱数据过程中发生未捕获的错误:', error)
    const message = error instanceof Error ? error.message : String(error)
    showError('加载食谱数据失败: ' + message)
    hasError.value = true
    errorMessage.value = '加载失败: ' + message
  } finally {
    isLoading.value = false
  }

  // 强制Vue更新视图
  setTimeout(() => {
    console.log('强制更新视图')
    const tempTitle = formData.title
    formData.title = tempTitle + ' '
    setTimeout(() => {
      formData.title = tempTitle
    }, 10)
  }, 100)
}

/**
 * 提交表单更新食谱
 */
const submitForm = async () => {
  // 表单验证
  let isValid = true

  // 重置错误信息
  errors.title = ''
  errors.description = ''
  errors.category = ''
  errors.ingredients = []
  errors.steps = []
  errors.image = ''

  // 验证标题
  if (!formData.title.trim()) {
    errors.title = '请输入食谱标题'
    isValid = false
  }

  // 验证描述
  if (!formData.description.trim()) {
    errors.description = '请输入食谱描述'
    isValid = false
  }

  // 验证分类
  if (!formData.category.trim()) {
    errors.category = '请选择食谱分类'
    isValid = false
  }

  // 验证食材
  formData.ingredients.forEach((ingredient, index) => {
    errors.ingredients[index] = ''
    if (!ingredient.name.trim()) {
      errors.ingredients[index] = '请输入食材名称'
      isValid = false
    }
  })

  // 验证步骤
  formData.steps.forEach((step, index) => {
    errors.steps[index] = ''
    if (!step.description.trim()) {
      errors.steps[index] = '请输入烹饪步骤'
      isValid = false
    }
  })

  if (!isValid) {
    showError('请修正表单中的错误')
    return
  }

  if (!recipeId.value) {
    showError('缺少食谱ID，无法更新')
    return
  }

  try {
    // 准备数据
    const recipeData: Partial<Recipe> = {
      title: formData.title,
      description: formData.description,
      prepTime: formData.prepTime,
      cookTime: formData.cookTime,
      servings: formData.servings,
      difficulty: formData.difficulty,
      category: [formData.category], // 转换为数组
      cuisine: formData.cuisine,
      tags: formData.tags,
      // 转换食材为数组
      ingredients: formData.ingredients.map((ing) =>
        `${ing.name} ${ing.amount} ${ing.unit}`.trim(),
      ),
      // 转换步骤为数组
      steps: formData.steps.map((step) => step.description),
      nutrition: formData.nutrition,
    }

    // 处理图片
    if (formData.imageFile) {
      const reader = new FileReader()
      const imagePromise = new Promise<void>((resolve, reject) => {
        reader.onload = () => {
          recipeData.image = reader.result as string
          resolve()
        }
        reader.onerror = () => {
          reject(new Error('图片处理失败'))
        }
      })
      reader.readAsDataURL(formData.imageFile)
      await imagePromise
    } else if (formData.imagePreview) {
      // 保留原有图片URL或Base64
      recipeData.image = formData.imagePreview
    }

    // 更新食谱数据
    console.log('提交食谱更新数据:', recipeData)
    await recipeStore.updateRecipe(recipeId.value, recipeData)

    showSuccess('食谱已成功更新')
    // 修改跳转，保存后直接回到我的食谱页面
    router.push('/my-recipes')
  } catch (error) {
    console.error('更新食谱失败:', error)
    showError('更新食谱失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 添加空白食材
 */
const addIngredient = () => {
  formData.ingredients.push({ id: uuidv4(), name: '', amount: '', unit: '' })
}

/**
 * 删除食材
 */
const removeIngredient = (index: number) => {
  if (formData.ingredients.length > 1) {
    formData.ingredients.splice(index, 1)
  }
}

/**
 * 添加空白步骤
 */
const addStep = () => {
  formData.steps.push({ id: uuidv4(), description: '' })
}

/**
 * 删除步骤
 */
const removeStep = (index: number) => {
  if (formData.steps.length > 1) {
    formData.steps.splice(index, 1)
  }
}

/**
 * 添加标签
 */
const addTag = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.trim()

  if (value && (event as KeyboardEvent).key === 'Enter') {
    event.preventDefault()
    if (!formData.tags.includes(value)) {
      formData.tags.push(value)
    }
    input.value = ''
  }
}

/**
 * 移除标签
 */
const removeTag = (index: number) => {
  formData.tags.splice(index, 1)
}

/**
 * 处理图片上传
 */
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]

    // 验证文件类型
    if (!file.type.match('image.*')) {
      errors.image = '请上传图片文件'
      return
    }

    // 验证文件大小 (最大5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.image = '图片大小不能超过5MB'
      return
    }

    formData.imageFile = file

    // 创建预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.imagePreview = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 处理图片错误
 */
const handleImageError = (event: Event) => {
  console.error('图片加载失败:', formData.imagePreview)
  errors.image = '图片加载失败，您可以上传新图片'

  // 防止递归错误，标记已处理过错误
  const imgElement = event.target as HTMLImageElement

  // 检查是否已经处理过这个图片错误
  if (imgElement.getAttribute('data-error-handled') === 'true') {
    console.log('图片已经尝试过错误恢复，不再重试')
    return
  }

  // 标记图片已处理错误
  imgElement.setAttribute('data-error-handled', 'true')

  // 清除原始预览URL
  formData.imagePreview = ''

  // 替换为内嵌的空白图标而不是外部URL
  imgElement.src =
    'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 300 200%22%3E%3Crect width%3D%22300%22 height%3D%22200%22 fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Ctext x%3D%22150%22 y%3D%22100%22 fill%3D%22%23aaa%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 font-family%3D%22Arial%2C sans-serif%22 font-size%3D%2220%22%3E图片加载失败%3C%2Ftext%3E%3C%2Fsvg%3E'
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  // 直接导航到我的食谱页面，避免触发ID检查逻辑
  router.push('/my-recipes')
}

/**
 * 处理返回按钮点击
 */
const handleBack = () => {
  // 直接返回上一页，避免触发ID检查
  router.push('/my-recipes')
}

/**
 * 验证数字输入
 */
const validateNumber = (value: number | undefined, min = 0): number => {
  if (value === undefined || isNaN(Number(value))) {
    return min
  }
  return Math.max(min, Number(value))
}

// 手动刷新数据（调试用）
const refreshData = async () => {
  if (recipeId.value) {
    console.log('手动刷新食谱数据...')
    await loadRecipeData(recipeId.value)
    console.log('数据刷新完成')
  } else {
    console.error('没有食谱ID，无法刷新数据')
  }
}

/**
 * 触发文件选择
 */
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
</script>

<template>
  <div class="edit-recipe-page">
    <div class="page-header">
      <ElButton @click="handleBack" class="back-button" type="text">
        <i class="el-icon-arrow-left"></i> 返回
      </ElButton>
      <h1>编辑食谱</h1>
    </div>

    <!-- 调试按钮 -->
    <div class="debug-section">
      <ElButton @click="refreshData" type="warning" class="debug-button"> 刷新食谱数据 </ElButton>
      <p class="debug-text">当前食谱ID: {{ recipeId }}</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>加载食谱数据中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-section">
      <p class="error-message">{{ errorMessage }}</p>
      <ElButton @click="refreshData" type="primary">重新加载</ElButton>
    </div>

    <!-- 编辑表单 -->
    <ElForm v-else @submit.prevent="submitForm" class="recipe-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <h2>基本信息</h2>

        <!-- 标题 -->
        <ElFormItem label="标题" :error="errors.title">
          <ElInput v-model="formData.title" placeholder="请输入食谱名称" />
        </ElFormItem>

        <!-- 描述 -->
        <ElFormItem label="描述" :error="errors.description">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请简要描述这道食谱"
          />
        </ElFormItem>

        <!-- 图片上传 -->
        <ElFormItem label="图片" :error="errors.image">
          <div class="image-upload">
            <input
              type="file"
              id="recipe-image"
              accept="image/*"
              @change="handleImageUpload"
              class="image-input"
              ref="fileInput"
            />
            <ElButton type="primary" @click="triggerFileInput" class="upload-btn">
              选择图片
            </ElButton>

            <div v-if="formData.imagePreview" class="image-preview">
              <img :src="formData.imagePreview" alt="食谱预览图" @error="handleImageError" />
            </div>
          </div>
        </ElFormItem>
      </div>

      <ElDivider />

      <!-- 烹饪信息 -->
      <div class="form-section">
        <h2>烹饪信息</h2>

        <!-- 准备时间 -->
        <ElFormItem label="准备时间(分钟)">
          <ElInputNumber
            v-model="formData.prepTime"
            :min="0"
            class="number-input"
            placeholder="准备时间(分钟)"
          />
        </ElFormItem>

        <!-- 烹饪时间 -->
        <ElFormItem label="烹饪时间(分钟)">
          <ElInputNumber
            v-model="formData.cookTime"
            :min="0"
            class="number-input"
            placeholder="烹饪时间(分钟)"
          />
        </ElFormItem>

        <!-- 份量 -->
        <ElFormItem label="份量">
          <ElInputNumber
            v-model="formData.servings"
            :min="1"
            class="number-input"
            placeholder="份量"
          />
        </ElFormItem>

        <!-- 难度 -->
        <ElFormItem label="难度">
          <ElSelect v-model="formData.difficulty" class="select-input">
            <ElOption label="简单" value="easy" />
            <ElOption label="中等" value="medium" />
            <ElOption label="困难" value="hard" />
          </ElSelect>
        </ElFormItem>

        <!-- 分类 -->
        <ElFormItem label="分类" :error="errors.category">
          <ElSelect v-model="formData.category" class="select-input" placeholder="请选择分类">
            <ElOption label="早餐" value="breakfast" />
            <ElOption label="午餐" value="lunch" />
            <ElOption label="晚餐" value="dinner" />
            <ElOption label="甜点" value="dessert" />
            <ElOption label="小吃" value="snack" />
            <ElOption label="汤" value="soup" />
            <ElOption label="沙拉" value="salad" />
            <ElOption label="主菜" value="main" />
            <ElOption label="配菜" value="side" />
            <ElOption label="饮料" value="beverage" />
          </ElSelect>
        </ElFormItem>

        <!-- 菜系 -->
        <ElFormItem label="菜系">
          <ElInput v-model="formData.cuisine" placeholder="例如：中式、西式、日式等" />
        </ElFormItem>
      </div>

      <ElDivider />

      <!-- 食材 -->
      <div class="form-section">
        <h2>食材</h2>

        <div
          v-for="(ingredient, index) in formData.ingredients"
          :key="ingredient.id"
          class="ingredient-row"
        >
          <ElFormItem :error="errors.ingredients[index]" class="ingredient-name">
            <ElInput v-model="ingredient.name" placeholder="食材名称" />
          </ElFormItem>

          <ElFormItem class="ingredient-amount">
            <ElInput v-model="ingredient.amount" placeholder="数量" />
          </ElFormItem>

          <ElFormItem class="ingredient-unit">
            <ElInput v-model="ingredient.unit" placeholder="单位" />
          </ElFormItem>

          <ElButton
            type="danger"
            circle
            @click="removeIngredient(index)"
            icon="el-icon-delete"
            class="remove-btn"
            :disabled="formData.ingredients.length <= 1"
          >
            删除
          </ElButton>
        </div>

        <ElButton type="primary" plain @click="addIngredient" class="add-btn"> 添加食材 </ElButton>
      </div>

      <ElDivider />

      <!-- 步骤 -->
      <div class="form-section">
        <h2>烹饪步骤</h2>

        <div v-for="(step, index) in formData.steps" :key="step.id" class="step-row">
          <div class="step-number">{{ index + 1 }}</div>

          <ElFormItem :error="errors.steps[index]" class="step-description">
            <ElInput
              v-model="step.description"
              type="textarea"
              :rows="2"
              placeholder="描述烹饪步骤"
            />
          </ElFormItem>

          <ElButton
            type="danger"
            circle
            @click="removeStep(index)"
            class="remove-btn"
            :disabled="formData.steps.length <= 1"
          >
            删除
          </ElButton>
        </div>

        <ElButton type="primary" plain @click="addStep" class="add-btn"> 添加步骤 </ElButton>
      </div>

      <ElDivider />

      <!-- 标签 -->
      <div class="form-section">
        <h2>标签</h2>

        <div class="tags-container">
          <div class="tags-input">
            <ElInput placeholder="输入标签，按回车添加" @keydown.enter="addTag" />
          </div>

          <div class="tags-list">
            <ElTag
              v-for="(tag, index) in formData.tags"
              :key="index"
              closable
              @close="removeTag(index)"
              class="tag-item"
            >
              {{ tag }}
            </ElTag>
          </div>
        </div>
      </div>

      <ElDivider />

      <!-- 营养信息 -->
      <div class="form-section">
        <h2>营养信息（可选）</h2>

        <div class="nutrition-grid">
          <ElFormItem label="热量(卡路里)">
            <ElInputNumber v-model="formData.nutrition.calories" :min="0" class="number-input" />
          </ElFormItem>

          <ElFormItem label="蛋白质(克)">
            <ElInputNumber v-model="formData.nutrition.protein" :min="0" class="number-input" />
          </ElFormItem>

          <ElFormItem label="碳水化合物(克)">
            <ElInputNumber v-model="formData.nutrition.carbs" :min="0" class="number-input" />
          </ElFormItem>

          <ElFormItem label="脂肪(克)">
            <ElInputNumber v-model="formData.nutrition.fat" :min="0" class="number-input" />
          </ElFormItem>
        </div>
      </div>

      <!-- 表单按钮 -->
      <div class="form-actions">
        <ElButton type="primary" @click="submitForm" class="submit-btn">保存更改</ElButton>
        <ElButton @click="cancelEdit" class="cancel-btn">取消</ElButton>
      </div>
    </ElForm>
  </div>
</template>

<style scoped>
.edit-recipe-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  font-size: 1rem;
  color: #409eff;
}

h1 {
  font-size: 2rem;
  color: #333;
  margin: 0 auto;
  text-align: center;
  flex-grow: 1;
}

h2 {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
}

.recipe-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ingredient-row,
.step-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 10px;
}

.ingredient-name {
  flex: 3;
}

.ingredient-amount,
.ingredient-unit {
  flex: 1;
}

.step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  margin-right: 10px;
  margin-top: 10px;
  font-weight: bold;
}

.step-description {
  flex: 1;
}

.add-btn {
  margin-top: 1rem;
}

.remove-btn {
  margin-top: 10px;
}

.image-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.image-input {
  display: none;
}

.image-preview {
  margin-top: 1rem;
  max-width: 300px;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  margin-right: 5px;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn,
.cancel-btn {
  min-width: 120px;
}

/* 调试部分样式 */
.debug-section {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px dashed #ff6b6b;
  border-radius: 4px;
  background-color: #fff5f5;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.debug-button {
  background-color: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
}

.debug-text {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* 加载状态样式 */
.loading-section {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态样式 */
.error-section {
  text-align: center;
  padding: 3rem;
  background-color: #fff8f8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #ffcdd2;
  margin-bottom: 2rem;
}

.error-message {
  color: #d32f2f;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .edit-recipe-page {
    padding: 1rem;
  }

  .recipe-form {
    padding: 1rem;
  }

  .nutrition-grid {
    grid-template-columns: 1fr;
  }

  .ingredient-row {
    flex-direction: column;
  }

  .ingredient-name,
  .ingredient-amount,
  .ingredient-unit {
    width: 100%;
    flex: none;
  }
}
</style>
