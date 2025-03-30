import express from 'express'
import {
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getUserRecipes,
  getFavoriteRecipes,
} from '../controllers/recipeController'
import { protect } from '../middleware/auth'

const router = express.Router()

// 公开路由
router.get('/', getAllRecipes)
router.get('/user/:userId', getUserRecipes)

// 保护路由（需要身份验证）
router.use(protect)
router.get('/favorites', getFavoriteRecipes)
router.post('/', createRecipe)

// 通用ID路由（放在末尾以避免路径冲突）
router.get('/:id', getRecipe)
router.put('/:id', updateRecipe)
router.delete('/:id', deleteRecipe)
router.post('/:id/favorite', toggleFavorite)

export default router
