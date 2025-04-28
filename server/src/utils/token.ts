import jwt from 'jsonwebtoken'
import { IUser } from '../models/User'

/**
 * 生成用户的JWT令牌
 * @param user 用户对象
 * @returns JWT令牌字符串
 */
export const generateToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
  }

  // 确保JWT_SECRET存在
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET环境变量未设置')
  }

  // 临时禁用eslint警告以允许代码运行
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt as any).sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  }) as string
}
