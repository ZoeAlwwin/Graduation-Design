import { Request, Response } from 'express'
import mongoose from 'mongoose'

/**
 * 处理MongoDB重复键错误
 * @param error 错误对象
 * @param res 响应对象
 */
export const handleDuplicateKeyError = (error: any, res: Response) => {
  const field = Object.keys(error.keyValue)[0]
  const message = `${field === 'email' ? '电子邮箱' : '用户名'}已被使用`
  return res.status(400).json({ message })
}

/**
 * 处理MongoDB验证错误
 * @param error 错误对象
 * @param res 响应对象
 */
export const handleValidationError = (error: mongoose.Error.ValidationError, res: Response) => {
  const errors = Object.values(error.errors).map((err) => err.message)
  const message = `无效输入数据：${errors.join(', ')}`
  return res.status(400).json({ message })
}

/**
 * 处理CastError（通常是ID无效）
 * @param error 错误对象
 * @param res 响应对象
 */
export const handleCastError = (error: mongoose.Error.CastError, res: Response) => {
  const message = `无效的${error.path}: ${error.value}`
  return res.status(400).json({ message })
}

/**
 * 控制器错误处理包装器
 * @param fn 控制器函数
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((error) => {
      console.error('操作错误:', error)

      // 处理不同类型的错误
      if (error.code === 11000) {
        return handleDuplicateKeyError(error, res)
      }

      if (error instanceof mongoose.Error.ValidationError) {
        return handleValidationError(error, res)
      }

      if (error instanceof mongoose.Error.CastError) {
        return handleCastError(error, res)
      }

      // 默认错误响应
      return res.status(500).json({
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    })
  }
}
