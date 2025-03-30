import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

// 扩展Express请求接口，添加用户属性
declare global {
  namespace Express {
    interface Request {
      user?: any
      userId?: string
    }
  }
}

// 验证JWT令牌的中间件
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined

    // 从请求头中获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // 如果没有token，返回未授权错误
    if (!token) {
      return res.status(401).json({
        message: '未授权访问，请登录以获取访问权限',
      })
    }

    // 验证token
    try {
      // 验证令牌并获取用户ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }

      // 查找用户
      const user = await User.findById(decoded.id)

      // 如果用户不存在，返回未授权错误
      if (!user) {
        return res.status(401).json({
          message: '该认证令牌所属的用户不存在',
        })
      }

      // 将用户信息附加到请求对象
      req.user = user
      req.userId = user.id
      next()
    } catch (error) {
      return res.status(401).json({
        message: '认证令牌无效或已过期',
      })
    }
  } catch (error) {
    console.error('认证错误:', error)
    return res.status(500).json({
      message: '服务器内部错误',
    })
  }
}

// 检查用户是否是资源的所有者
export const isOwner = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 资源ID通常通过路径参数传递
    const resourceId = req.params.id

    // 从请求对象中获取用户ID（由前置的protect中间件设置）
    const userId = req.userId

    // 如果资源的作者/所有者ID与当前用户ID不匹配
    // 注意：这里的检查逻辑取决于您的资源模型
    // 您需要根据实际数据模型来检查所有权

    // 此处仅作示例，实际逻辑需要根据您的模型来编写
    if (resourceId && req.body.author && req.body.author.toString() !== userId) {
      return res.status(403).json({
        message: '您没有权限执行此操作',
      })
    }

    next()
  } catch (error) {
    console.error('所有者验证错误:', error)
    return res.status(500).json({
      message: '服务器内部错误',
    })
  }
}
