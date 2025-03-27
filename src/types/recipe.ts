/**
 * 食谱相关类型定义
 * 包含食谱、食材、烹饪步骤、营养信息等数据结构的类型定义
 */

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface CookingStep {
  id: string;
  description: string;
  imageUrl?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  omega3?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number; // 单位：分钟
  cookTime: number; // 单位：分钟
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  category: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutrition?: NutritionInfo;
  author: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface RecipeFilter {
  search?: string;
  category?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  maxCookTime?: number;
  ingredients?: string[];
} 