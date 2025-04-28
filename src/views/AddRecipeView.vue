<script setup lang="ts">
/**
 * 添加/编辑食谱视图组件
 * 功能：新增食谱或编辑现有食谱
 * 包含：表单输入、食材和步骤管理、标签选择、营养信息编辑等
 */
import { ref, reactive, onMounted } from 'vue'
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
// 当前模式：add-新增，edit-编辑
const mode = ref<'add' | 'edit'>('add')

// 记录最近创建的食谱ID
const createdRecipeId = ref<string | null>(null)

/**
 * 初始化组件
 * 1. 确保store初始化
 * 2. 判断当前模式
 * 3. 如果是编辑模式，加载食谱数据
 */
onMounted(async () => {
  console.log('AddRecipeView 组件挂载')
  // 强制重置食谱列表，确保从服务器加载最新数据
  recipeStore.resetStore()
  console.log('初始化食谱存储')
  await recipeStore.initialize()

  // 检查路由参数，判断是否为编辑模式
  const id = route.params.id as string
  console.log('路由参数 id:', id)
  if (id) {
    console.log('进入编辑模式')
    mode.value = 'edit'
    recipeId.value = id
    await loadRecipeData(id)
  } else {
    console.log('进入添加模式')
  }
})

/**
 * 加载食谱数据
 * @param id 食谱ID
 */
const loadRecipeData = async (id: string) => {
  console.log('开始加载食谱数据, ID:', id)
  try {
    // 直接从API获取数据，绕过store缓存
    console.log('直接请求API获取食谱')
    const response = await fetch(`http://localhost:5001/api/recipes/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API请求失败，状态码: ${response.status}`)
    }

    const responseData = await response.json()
    console.log('API直接响应:', responseData)

    if (!responseData.data) {
      console.error('API响应中没有data字段')
      showError('获取食谱数据失败')
      return
    }

    const recipe = responseData.data
    console.log('获取到食谱详情:', recipe)

    // 检查当前用户是否是食谱作者
    console.log('检查权限, 食谱作者:', recipe.author?.id, '当前用户:', userStore.currentUser?.id)
    if (recipe.author?.id !== userStore.currentUser?.id) {
      console.error('权限不足')
      showError('您没有权限编辑该食谱')
      router.push('/my-recipes')
      return
    }

    // 填充表单数据
    console.log('填充表单数据开始')
    formData.title = recipe.title || ''
    formData.description = recipe.description || ''

    // 处理图片URL
    if (recipe.image) {
      console.log('设置食谱图片:', recipe.image)
      formData.imagePreview = recipe.image

      // 如果图片URL包含data:image前缀，说明是Base64图片
      if (!recipe.image.startsWith('data:image')) {
        console.log('图片是外部URL，可能需要处理跨域或404问题')
      }
    } else {
      console.warn('食谱没有图片')
    }

    formData.prepTime = recipe.prepTime || 0
    formData.cookTime = recipe.cookTime || 0
    formData.servings = recipe.servings || 1
    formData.difficulty = recipe.difficulty || 'medium'

    // 处理分类信息
    if (Array.isArray(recipe.category) && recipe.category.length > 0) {
      formData.category = recipe.category[0]
    } else if (typeof recipe.category === 'string') {
      formData.category = recipe.category
    } else {
      formData.category = ''
    }

    formData.cuisine = recipe.cuisine || ''

    // 处理标签
    if (Array.isArray(recipe.tags)) {
      formData.tags = [...recipe.tags]
    } else {
      formData.tags = []
    }

    // 处理食材
    formData.ingredients = []
    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      console.log('处理食材数据:', recipe.ingredients)
      recipe.ingredients.forEach((ingredient: string) => {
        try {
          // 在Recipe接口中，ingredient是string类型
          // 解析：假设格式为"名称 数量 单位"
          const parts = String(ingredient).split(' ')
          // 至少提取一个非空部分作为名称
          let name = parts[0] || ''
          const amount = parts[1] || ''
          const unit = parts.slice(2).join(' ') || ''

          // 确保至少有名称
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
          console.error('处理食材时出错:', e)
        }
      })
    }

    // 确保至少有一个食材
    if (formData.ingredients.length === 0) {
      formData.ingredients = [{ id: uuidv4(), name: '', amount: '', unit: '' }]
    }

    // 处理步骤
    formData.steps = []
    if (Array.isArray(recipe.steps) && recipe.steps.length > 0) {
      console.log('处理步骤数据:', recipe.steps)
      recipe.steps.forEach((step: string) => {
        try {
          // 在Recipe接口中，step是string类型
          formData.steps.push({
            id: uuidv4(),
            description: String(step),
          })
        } catch (e) {
          console.error('处理步骤时出错:', e)
        }
      })
    }

    // 确保至少有一个步骤
    if (formData.steps.length === 0) {
      formData.steps = [{ id: uuidv4(), description: '' }]
    }

    // 处理营养信息
    if (recipe.nutrition) {
      try {
        formData.nutrition = {
          calories: recipe.nutrition.calories || 0,
          protein: recipe.nutrition.protein || 0,
          carbs: recipe.nutrition.carbs || 0,
          fat: recipe.nutrition.fat || 0,
        }
      } catch (e) {
        console.error('处理营养信息时出错:', e)
        formData.nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      }
    }

    console.log('食谱数据加载完成,表单数据:', formData)
  } catch (error) {
    console.error('加载食谱数据失败:', error)
    showError('加载食谱数据失败: ' + (error instanceof Error ? error.message : String(error)))
    router.push('/my-recipes')
  }
}

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

// 文件输入框引用
const fileInput = ref<HTMLInputElement | null>(null)

/**
 * 触发文件选择框
 */
const triggerFileInput = () => {
  fileInput.value?.click()
}

/**
 * 添加新的食材输入行
 */
const addIngredient = () => {
  formData.ingredients.push({
    id: uuidv4(),
    name: '',
    amount: '',
    unit: '',
  })
}

/**
 * 删除指定的食材输入行
 * @param index 要删除的食材索引
 */
const removeIngredient = (index: number) => {
  if (formData.ingredients.length > 1) {
    formData.ingredients.splice(index, 1)
  }
}

/**
 * 添加新的步骤输入行
 */
const addStep = () => {
  formData.steps.push({
    id: uuidv4(),
    description: '',
  })
}

/**
 * 删除指定的步骤输入行
 * @param index 要删除的步骤索引
 */
const removeStep = (index: number) => {
  if (formData.steps.length > 1) {
    formData.steps.splice(index, 1)
  }
}

/**
 * 切换标签选中状态
 * @param tag 要切换的标签
 */
const toggleTag = (tag: string) => {
  const index = formData.tags.indexOf(tag)
  if (index === -1) {
    formData.tags.push(tag)
  } else {
    formData.tags.splice(index, 1)
  }
}

// 自定义标签输入
const customTag = ref('')

/**
 * 添加自定义标签
 */
const addCustomTag = () => {
  const tag = customTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    customTag.value = ''
  }
}

/**
 * 处理图片上传
 * @param event 文件上传事件
 */
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      errors.image = '请上传图片文件'
      return
    }

    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      errors.image = '图片大小不能超过5MB'
      return
    }

    // 清除之前的错误
    errors.image = ''

    // 保存文件
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
 * 处理图片加载错误
 */
const handleImageError = () => {
  console.error('图片加载失败')
  // 避免替换原始图片URL，因为它仍需用于提交表单
  const imgElement = document.querySelector('.image-preview img') as HTMLImageElement
  if (imgElement) {
    // 设置为占位图片
    imgElement.src = 'https://via.placeholder.com/300x200?text=图片加载失败'
  }
}

/**
 * 移除已上传的图片
 */
const removeImage = () => {
  formData.imageFile = null
  formData.imagePreview = ''
  errors.image = ''
}

/**
 * 验证表单
 * @returns 表单是否有效
 */
const validateForm = () => {
  let isValid = true

  // 重置错误信息
  errors.title = ''
  errors.description = ''
  errors.category = ''
  errors.ingredients = []
  errors.steps = []

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
  if (!formData.category) {
    errors.category = '请选择食谱分类'
    isValid = false
  }

  // 验证食材
  formData.ingredients.forEach((ing, index) => {
    if (!ing.name.trim()) {
      if (!errors.ingredients[index]) {
        errors.ingredients[index] = ''
      }
      errors.ingredients[index] += '请输入食材名称 '
      isValid = false
    }

    if (!ing.amount.trim()) {
      if (!errors.ingredients[index]) {
        errors.ingredients[index] = ''
      }
      errors.ingredients[index] += '请输入食材数量 '
      isValid = false
    }
  })

  // 验证步骤
  formData.steps.forEach((step, index) => {
    if (!step.description.trim()) {
      errors.steps[index] = '请输入烹饪步骤描述'
      isValid = false
    }
  })

  return isValid
}

/**
 * 重置表单数据
 * 注意：不清除createdRecipeId，以便用户可以看到"查看食谱"按钮
 */
const resetForm = () => {
  // 重置表单字段
  formData.title = ''
  formData.description = ''
  formData.imageFile = null
  formData.imagePreview = ''
  formData.prepTime = 0
  formData.cookTime = 0
  formData.servings = 1
  formData.difficulty = 'medium'
  formData.category = ''
  formData.cuisine = ''
  formData.tags = []
  formData.ingredients = [{ id: uuidv4(), name: '', amount: '', unit: '' }]
  formData.steps = [{ id: uuidv4(), description: '' }]
  formData.nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  // 重置错误信息
  errors.title = ''
  errors.description = ''
  errors.category = ''
  errors.ingredients = []
  errors.steps = []
  errors.image = ''

  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  // 注意：我们不清除createdRecipeId，以便用户可以看到"查看食谱"按钮
  // 保持在表单重置后用户仍能查看刚创建的食谱
}

/**
 * 检查图片是否已上传，针对编辑和新增两种模式进行判断
 * @returns 图片检查是否通过
 */
const checkImage = () => {
  // 如果是编辑模式并且没有上传新图片，保留原图
  if (mode.value === 'edit' && !formData.imageFile && formData.imagePreview) {
    return true
  }

  // 新增模式下必须上传图片
  if (!formData.imagePreview) {
    errors.image = '请上传食谱图片'
    return false
  }

  return true
}

/**
 * 提交表单
 */
const submitForm = async () => {
  console.log('提交表单开始')
  // 表单验证
  if (!validateForm()) {
    console.error('表单验证失败')
    return
  }

  try {
    // 检查图片是否已上传
    if (!checkImage()) {
      console.error('图片检查失败')
      return
    }

    // 将图片转换为Base64格式
    let imageBase64 = formData.imagePreview

    // 如果有新上传的图片文件，需要转换为Base64
    if (formData.imageFile) {
      console.log('处理新上传的图片文件')
      imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }
        reader.readAsDataURL(formData.imageFile!)
      })
    }

    // 准备食材数据
    const ingredients = formData.ingredients.map(
      (ing) => `${ing.name.trim()} ${ing.amount.trim()} ${ing.unit.trim()}`,
    )

    // 准备步骤数据
    const steps = formData.steps.map((step) => step.description.trim())

    // 准备食谱数据
    const recipeData: Partial<Recipe> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      image: imageBase64,
      prepTime: formData.prepTime,
      cookTime: formData.cookTime,
      servings: formData.servings,
      difficulty: formData.difficulty,
      category: [formData.category], // 转换为数组格式
      cuisine: formData.cuisine,
      tags: formData.tags,
      ingredients: ingredients,
      steps: steps,
      nutrition: formData.nutrition,
      author: {
        id: userStore.currentUser?.id || '',
        username: userStore.currentUser?.username || '匿名用户',
        avatar: userStore.currentUser?.avatar,
      },
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false,
      favoriteCount: 0,
    }

    console.log('添加新食谱')

    // 添加新食谱
    const result = await recipeStore.addRecipe(recipeData)
    console.log('添加结果:', result)

    if (result) {
      showSuccess('食谱保存成功')
      // 保存创建的食谱ID
      createdRecipeId.value = result.id
      // 重置表单
      resetForm()
    } else {
      throw new Error('保存食谱失败')
    }
  } catch (error) {
    console.error('保存食谱失败:', error)
    let errorMessage = '保存食谱失败'

    if (error instanceof Error) {
      if (error.message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络后重试'
      } else if (error.message.includes('unauthorized')) {
        errorMessage = '请先登录后再操作食谱'
      } else if (error.message.includes('validation')) {
        errorMessage = '数据验证失败，请检查必填项是否都已填写'
      } else if (error.message.includes('image')) {
        errorMessage = '图片处理失败，请尝试重新上传图片'
      } else {
        errorMessage = `操作失败：${error.message}`
      }
    }

    // 显示错误消息
    showError(errorMessage)
  }
}

/**
 * 验证数字输入
 * @param value 要验证的数字值
 * @param field 字段名称
 * @param min 最小值，默认为0
 * @returns 验证后的数字
 */
const validateNumber = (value: number | undefined, field: string, min = 0): number => {
  // 如果输入为空或无效，返回最小值
  if (value === undefined || isNaN(Number(value))) {
    // 根据字段设置默认值
    const defaultValue = field === 'servings' ? 1 : min

    // 更新相应字段
    if (field === 'servings') {
      formData.servings = defaultValue
    } else if (field.includes('nutrition')) {
      const nutritionField = field.split('.')[1]
      formData.nutrition[nutritionField as keyof typeof formData.nutrition] = defaultValue
    } else {
      const fieldKey = field as keyof typeof formData
      if (fieldKey === 'prepTime' || fieldKey === 'cookTime' || fieldKey === 'servings') {
        ;(formData[fieldKey] as number) = defaultValue
      }
    }
    return defaultValue
  }

  // 根据字段类型设置不同的最小值
  const minValue = field === 'servings' ? Math.max(1, min) : min

  // 确保值不小于最小值
  if (value < minValue) {
    return minValue
  }

  return value
}
</script>

<template>
  <div class="add-recipe-page">
    <div class="page-header">
      <ElButton @click="router.go(-1)" class="back-button" type="text">
        <i class="el-icon-arrow-left"></i> 返回
      </ElButton>
      <h1>添加新食谱</h1>
    </div>

    <ElForm @submit.prevent="submitForm" class="recipe-form" label-position="top">
      <div class="form-section">
        <h2>基本信息</h2>

        <ElFormItem label="食谱名称" required :error="errors.title">
          <ElInput v-model="formData.title" placeholder="输入食谱名称，例如：香煎三文鱼" />
        </ElFormItem>

        <ElFormItem label="食谱描述" required :error="errors.description">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="简短描述这道菜的特点、口味或由来"
          />
        </ElFormItem>

        <ElFormItem label="食谱图片" required :error="errors.image">
          <div class="image-upload-container">
            <div v-if="formData.imagePreview" class="image-preview">
              <img :src="formData.imagePreview" alt="食谱预览图" @error="handleImageError" />
              <ElButton
                type="danger"
                circle
                size="small"
                @click="removeImage"
                class="remove-image-btn"
                >×</ElButton
              >
            </div>
            <div v-else class="image-upload-box" @click="triggerFileInput">
              <input
                ref="fileInput"
                type="file"
                id="image"
                accept="image/*"
                @change="handleImageUpload"
                class="image-input"
                style="display: none"
              />
              <div class="upload-placeholder">
                <i class="el-icon-picture"></i>
                <p>点击上传图片</p>
                <p class="upload-hint">支持jpg、png格式，大小不超过5MB</p>
              </div>
            </div>
          </div>
        </ElFormItem>

        <div class="form-row">
          <ElFormItem label="准备时间（分钟）" class="half">
            <ElInputNumber
              v-model="formData.prepTime"
              :min="0"
              :step="1"
              @change="(val) => (formData.prepTime = validateNumber(val, 'prepTime'))"
            />
          </ElFormItem>

          <ElFormItem label="烹饪时间（分钟）" class="half">
            <ElInputNumber
              v-model="formData.cookTime"
              :min="0"
              :step="1"
              @change="(val) => (formData.cookTime = validateNumber(val, 'cookTime'))"
            />
          </ElFormItem>
        </div>

        <div class="form-row">
          <ElFormItem label="份量（人数）" class="half">
            <ElInputNumber
              v-model="formData.servings"
              :min="1"
              :step="1"
              @change="(val) => (formData.servings = validateNumber(val, 'servings', 1))"
            />
          </ElFormItem>

          <ElFormItem label="难度" class="half">
            <ElSelect v-model="formData.difficulty" placeholder="选择难度">
              <ElOption value="easy" label="简单" />
              <ElOption value="medium" label="中等" />
              <ElOption value="hard" label="困难" />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElFormItem label="分类" required :error="errors.category">
          <ElSelect v-model="formData.category" placeholder="请选择分类">
            <ElOption value="" label="请选择分类" disabled />
            <ElOption
              v-for="category in recipeStore.categories"
              :key="category"
              :value="category"
              :label="category"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="菜系">
          <ElInput v-model="formData.cuisine" placeholder="输入菜系类别" />
        </ElFormItem>
      </div>

      <ElDivider />

      <div class="form-section">
        <h2>标签</h2>
        <div class="tags-container">
          <div class="popular-tags">
            <ElTag
              v-for="tag in recipeStore.popularTags"
              :key="tag"
              :type="formData.tags.includes(tag) ? 'success' : 'info'"
              @click="toggleTag(tag)"
              class="tag-option"
              :effect="formData.tags.includes(tag) ? 'dark' : 'plain'"
            >
              {{ tag }}
            </ElTag>
          </div>

          <div class="custom-tag-input">
            <ElInput v-model="customTag" placeholder="添加自定义标签" @keyup.enter="addCustomTag">
              <template #append>
                <ElButton @click="addCustomTag">添加</ElButton>
              </template>
            </ElInput>
          </div>

          <div v-if="formData.tags.length > 0" class="selected-tags">
            <h3>已选标签：</h3>
            <div class="tag-list">
              <ElTag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                @close="toggleTag(tag)"
                type="success"
                effect="dark"
                class="selected-tag"
              >
                {{ tag }}
              </ElTag>
            </div>
          </div>
        </div>
      </div>

      <ElDivider />

      <div class="form-section">
        <h2>食材 <span class="required">*</span></h2>
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
            <ElInput v-model="ingredient.unit" placeholder="单位（如克、个）" />
          </ElFormItem>

          <ElButton
            type="danger"
            @click="removeIngredient(index)"
            :disabled="formData.ingredients.length <= 1"
            class="remove-row-btn"
            size="small"
          >
            删除
          </ElButton>
        </div>
        <ElButton type="primary" plain @click="addIngredient" class="add-row-btn">
          <i class="el-icon-plus"></i> 添加食材
        </ElButton>
      </div>

      <ElDivider />

      <div class="form-section">
        <h2>烹饪步骤 <span class="required">*</span></h2>
        <div v-for="(step, index) in formData.steps" :key="step.id" class="step-row">
          <div class="step-number">{{ index + 1 }}</div>

          <ElFormItem :error="errors.steps[index]" class="step-description">
            <ElInput
              v-model="step.description"
              type="textarea"
              :rows="2"
              placeholder="描述这个步骤的详细操作"
            />
          </ElFormItem>

          <ElButton
            type="danger"
            @click="removeStep(index)"
            :disabled="formData.steps.length <= 1"
            class="remove-row-btn"
            size="small"
          >
            删除
          </ElButton>
        </div>
        <ElButton type="primary" plain @click="addStep" class="add-row-btn">
          <i class="el-icon-plus"></i> 添加步骤
        </ElButton>
      </div>

      <ElDivider />

      <div class="form-section">
        <h2>营养信息（可选）</h2>
        <div class="nutrition-grid">
          <ElFormItem label="热量（千卡）">
            <ElInputNumber
              v-model="formData.nutrition.calories"
              :min="0"
              :step="1"
              @change="
                (val) => (formData.nutrition.calories = validateNumber(val, 'nutrition.calories'))
              "
              class="number-input"
            />
          </ElFormItem>

          <ElFormItem label="蛋白质（克）">
            <ElInputNumber
              v-model="formData.nutrition.protein"
              :min="0"
              :step="0.1"
              @change="
                (val) => (formData.nutrition.protein = validateNumber(val, 'nutrition.protein'))
              "
              class="number-input"
            />
          </ElFormItem>

          <ElFormItem label="碳水化合物（克）">
            <ElInputNumber
              v-model="formData.nutrition.carbs"
              :min="0"
              :step="0.1"
              @change="(val) => (formData.nutrition.carbs = validateNumber(val, 'nutrition.carbs'))"
              class="number-input"
            />
          </ElFormItem>

          <ElFormItem label="脂肪（克）">
            <ElInputNumber
              v-model="formData.nutrition.fat"
              :min="0"
              :step="0.1"
              @change="(val) => (formData.nutrition.fat = validateNumber(val, 'nutrition.fat'))"
              class="number-input"
            />
          </ElFormItem>
        </div>
      </div>

      <div class="form-actions">
        <ElButton @click="router.go(-1)" class="cancel-btn">取消</ElButton>
        <ElButton type="primary" native-type="submit" class="submit-btn">保存食谱</ElButton>
      </div>
    </ElForm>

    <!-- 新创建的食谱查看按钮 -->
    <div v-if="createdRecipeId" class="success-actions">
      <p class="success-message">食谱创建成功！您可以继续添加新的食谱，或查看刚刚创建的食谱。</p>
      <ElButton type="success" @click="router.push(`/recipe/${createdRecipeId}`)">
        查看食谱
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.add-recipe-page {
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

.recipe-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.half {
  flex: 1;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.number-input {
  width: 100%;
}

.required {
  color: #f56c6c;
  margin-left: 4px;
}

.error-text {
  color: #f56c6c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.tags-container {
  margin-bottom: 1rem;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.tag-option {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-option:hover {
  transform: scale(1.05);
}

.custom-tag-input {
  margin-bottom: 1.5rem;
}

.selected-tags h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.remove-row-btn {
  margin-top: 10px;
}

.add-row-btn {
  margin-top: 1rem;
}

.image-upload-container {
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.image-upload-box {
  width: 100%;
  max-width: 300px;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: border-color 0.3s;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-box:hover {
  border-color: #409eff;
  background-color: #f0f7ff;
}

.image-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  pointer-events: none;
}

.upload-placeholder i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #409eff;
}

.upload-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
}

.submit-btn,
.cancel-btn {
  min-width: 120px;
}

.success-actions {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f0f9eb;
  border-radius: 8px;
  border: 1px solid #e1f3d8;
  text-align: center;
}

.success-message {
  margin-bottom: 1.5rem;
  color: #67c23a;
  font-weight: 500;
}

@media (max-width: 768px) {
  .add-recipe-page {
    padding: 1rem;
  }

  .recipe-form {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .nutrition-grid {
    grid-template-columns: 1fr;
  }

  .ingredient-row {
    flex-wrap: wrap;
  }

  .ingredient-name {
    flex: 1 0 100%;
    margin-bottom: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>

<style>
/* 全局样式，影响 Element Plus 组件 */
.el-message--success {
  background-color: #f0f9eb !important;
  border-color: #67c23a !important;
  min-width: 300px !important;
  padding: 15px 20px !important;
  font-size: 16px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.el-message__content {
  font-size: 16px !important;
  color: #333 !important;
  font-weight: bold !important;
}

.el-message__icon {
  font-size: 20px !important;
  margin-right: 12px !important;
}

.el-message .el-message__closeBtn {
  font-size: 18px !important;
  right: 15px !important;
}
</style>
