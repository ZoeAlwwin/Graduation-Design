<script setup lang="ts">
/**
 * 添加/编辑食谱视图组件
 * 功能：新增食谱或编辑现有食谱
 * 包含：表单输入、食材和步骤管理、标签选择、营养信息编辑等
 */
import { ref, reactive } from 'vue'
import { useRecipeStore } from '@/stores/recipe'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import type { Recipe, Ingredient, CookingStep } from '@/types/recipe'

const recipeStore = useRecipeStore()
const router = useRouter()

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  imageUrl: 'https://source.unsplash.com/random/300x200/?food',
  prepTime: 0,
  cookTime: 0,
  servings: 1,
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  category: '',
  tags: [] as string[],
  ingredients: [
    { id: uuidv4(), name: '', amount: '', unit: '' }
  ] as Ingredient[],
  steps: [
    { id: uuidv4(), description: '' }
  ] as CookingStep[],
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  }
})

// 表单验证
const errors = reactive({
  title: '',
  description: '',
  category: '',
  ingredients: [] as string[],
  steps: [] as string[]
})

/**
 * 添加新的食材输入行
 */
const addIngredient = () => {
  formData.ingredients.push({
    id: uuidv4(),
    name: '',
    amount: '',
    unit: ''
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
    description: ''
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
 * 提交表单
 * 验证表单数据并保存食谱
 */
const submitForm = () => {
  if (!validateForm()) {
    window.scrollTo(0, 0)
    return
  }
  
  const recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> = {
    title: formData.title,
    description: formData.description,
    imageUrl: formData.imageUrl,
    prepTime: formData.prepTime,
    cookTime: formData.cookTime,
    servings: formData.servings,
    difficulty: formData.difficulty,
    category: formData.category,
    tags: formData.tags,
    ingredients: formData.ingredients.map(ing => ({
      ...ing,
      name: ing.name.trim(),
      amount: ing.amount.trim(),
      unit: ing.unit.trim()
    })),
    steps: formData.steps.map(step => ({
      ...step,
      description: step.description.trim()
    })),
    nutrition: formData.nutrition,
    author: '用户'
  }
  
  const recipeId = recipeStore.addRecipe(recipeData)
  
  // 跳转到新创建的食谱详情页
  router.push(`/recipe/${recipeId}`)
}
</script>

<template>
  <div class="add-recipe-page">
    <h1>添加新食谱</h1>
    
    <form @submit.prevent="submitForm" class="recipe-form">
      <div class="form-section">
        <h2>基本信息</h2>
        
        <div class="form-group">
          <label for="title">食谱名称 <span class="required">*</span></label>
          <input 
            type="text" 
            id="title" 
            v-model="formData.title" 
            placeholder="输入食谱名称，例如：香煎三文鱼"
          />
          <p v-if="errors.title" class="error-text">{{ errors.title }}</p>
        </div>
        
        <div class="form-group">
          <label for="description">食谱描述 <span class="required">*</span></label>
          <textarea 
            id="description" 
            v-model="formData.description" 
            rows="3" 
            placeholder="简短描述这道菜的特点、口味或由来"
          ></textarea>
          <p v-if="errors.description" class="error-text">{{ errors.description }}</p>
        </div>
        
        <div class="form-group">
          <label for="imageUrl">图片URL</label>
          <input 
            type="text" 
            id="imageUrl" 
            v-model="formData.imageUrl" 
            placeholder="输入食谱图片的URL地址"
          />
          <p class="help-text">如果不填写，将使用随机食物图片</p>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label for="prepTime">准备时间（分钟）</label>
            <input 
              type="number" 
              id="prepTime" 
              v-model="formData.prepTime" 
              min="0"
            />
          </div>
          
          <div class="form-group half">
            <label for="cookTime">烹饪时间（分钟）</label>
            <input 
              type="number" 
              id="cookTime" 
              v-model="formData.cookTime" 
              min="0"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label for="servings">份量（人数）</label>
            <input 
              type="number" 
              id="servings" 
              v-model="formData.servings" 
              min="1"
            />
          </div>
          
          <div class="form-group half">
            <label for="difficulty">难度</label>
            <select id="difficulty" v-model="formData.difficulty">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="category">分类 <span class="required">*</span></label>
          <select id="category" v-model="formData.category">
            <option value="">请选择分类</option>
            <option v-for="category in recipeStore.categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <p v-if="errors.category" class="error-text">{{ errors.category }}</p>
        </div>
      </div>
      
      <div class="form-section">
        <h2>标签</h2>
        <div class="tags-container">
          <div class="popular-tags">
            <span 
              v-for="tag in recipeStore.popularTags" 
              :key="tag"
              @click="toggleTag(tag)"
              :class="['tag-option', { active: formData.tags.includes(tag) }]"
            >
              {{ tag }}
            </span>
          </div>
          
          <div class="custom-tag-input">
            <input 
              type="text" 
              v-model="customTag" 
              placeholder="添加自定义标签"
              @keyup.enter="addCustomTag"
            />
            <button type="button" @click="addCustomTag" class="add-tag-btn">添加</button>
          </div>
          
          <div v-if="formData.tags.length > 0" class="selected-tags">
            <h3>已选标签：</h3>
            <div class="tag-list">
              <span v-for="tag in formData.tags" :key="tag" class="selected-tag">
                {{ tag }}
                <button type="button" @click="toggleTag(tag)" class="remove-tag-btn">×</button>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h2>食材 <span class="required">*</span></h2>
        <div v-for="(ingredient, index) in formData.ingredients" :key="ingredient.id" class="ingredient-row">
          <div class="ingredient-name">
            <input 
              type="text" 
              v-model="ingredient.name" 
              placeholder="食材名称"
            />
          </div>
          <div class="ingredient-amount">
            <input 
              type="text" 
              v-model="ingredient.amount" 
              placeholder="数量"
            />
          </div>
          <div class="ingredient-unit">
            <input 
              type="text" 
              v-model="ingredient.unit" 
              placeholder="单位（如克、个）"
            />
          </div>
          <button 
            type="button" 
            @click="removeIngredient(index)" 
            class="remove-row-btn"
            :disabled="formData.ingredients.length <= 1"
          >
            删除
          </button>
          <p v-if="errors.ingredients[index]" class="error-text">{{ errors.ingredients[index] }}</p>
        </div>
        <button type="button" @click="addIngredient" class="add-row-btn">
          添加食材
        </button>
      </div>
      
      <div class="form-section">
        <h2>烹饪步骤 <span class="required">*</span></h2>
        <div v-for="(step, index) in formData.steps" :key="step.id" class="step-row">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-description">
            <textarea 
              v-model="step.description" 
              rows="2" 
              placeholder="描述这个步骤的详细操作"
            ></textarea>
          </div>
          <button 
            type="button" 
            @click="removeStep(index)" 
            class="remove-row-btn"
            :disabled="formData.steps.length <= 1"
          >
            删除
          </button>
          <p v-if="errors.steps[index]" class="error-text">{{ errors.steps[index] }}</p>
        </div>
        <button type="button" @click="addStep" class="add-row-btn">
          添加步骤
        </button>
      </div>
      
      <div class="form-section">
        <h2>营养信息（可选）</h2>
        <div class="form-row">
          <div class="form-group quarter">
            <label for="calories">热量（千卡）</label>
            <input 
              type="number" 
              id="calories" 
              v-model="formData.nutrition.calories" 
              min="0"
            />
          </div>
          
          <div class="form-group quarter">
            <label for="protein">蛋白质（克）</label>
            <input 
              type="number" 
              id="protein" 
              v-model="formData.nutrition.protein" 
              min="0"
            />
          </div>
          
          <div class="form-group quarter">
            <label for="carbs">碳水化合物（克）</label>
            <input 
              type="number" 
              id="carbs" 
              v-model="formData.nutrition.carbs" 
              min="0"
            />
          </div>
          
          <div class="form-group quarter">
            <label for="fat">脂肪（克）</label>
            <input 
              type="number" 
              id="fat" 
              v-model="formData.nutrition.fat" 
              min="0"
            />
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="router.go(-1)" class="cancel-btn">取消</button>
        <button type="submit" class="submit-btn">保存食谱</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-recipe-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.recipe-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.form-section {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.form-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: var(--text-color);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.half {
  flex: 1;
}

.quarter {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.required {
  color: #e53e3e;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="number"]:focus,
textarea:focus,
select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.error-text {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.help-text {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
}

.tags-container {
  margin-bottom: 1rem;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-option {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition);
}

.tag-option:hover {
  background-color: #e0e0e0;
}

.tag-option.active {
  background-color: var(--primary-color);
  color: white;
}

.custom-tag-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.custom-tag-input input {
  flex: 1;
}

.add-tag-btn {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.add-tag-btn:hover {
  background-color: #3db5ad;
}

.selected-tags h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 20px;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ingredient-row, .step-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: flex-start;
  position: relative;
}

.ingredient-name {
  flex: 2;
}

.ingredient-amount, .ingredient-unit {
  flex: 1;
}

.step-number {
  width: 2rem;
  height: 2rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
}

.step-description {
  flex: 1;
}

.remove-row-btn {
  background-color: #f87171;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.remove-row-btn:hover:not(:disabled) {
  background-color: #ef4444;
}

.remove-row-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-row-btn {
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
}

.add-row-btn:hover {
  background-color: #3db5ad;
}

.form-actions {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: var(--transition);
}

.cancel-btn:hover {
  background-color: #f0f0f0;
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.submit-btn:hover {
  background-color: #ff5252;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .ingredient-row {
    flex-wrap: wrap;
  }
  
  .ingredient-name {
    flex: 1 0 100%;
    margin-bottom: 0.5rem;
  }
  
  .ingredient-amount, .ingredient-unit {
    flex: 1;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .submit-btn {
    width: 100%;
  }
}
</style> 