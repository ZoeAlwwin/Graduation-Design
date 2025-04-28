import express from 'express'
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  getUserRecipes,
  getUserFavorites,
} from '../controllers/userController'
import { protect } from '../middleware/auth'

const router = express.Router()

// 公开路由
router.post('/register', register)
router.post('/login', login)

// 保护路由（需要身份验证）
router.use(protect)
router.get('/me', getCurrentUser)
router.put('/profile', updateProfile)
router.put('/change-password', changePassword)
router.get('/recipes', getUserRecipes)
router.get('/favorites', getUserFavorites)

export default router
