import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes'
import recipeRoutes from './routes/recipeRoutes'

// 加载环境变量
dotenv.config()

// 创建Express应用
const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 路由
app.use('/api/users', userRoutes)
app.use('/api/recipes', recipeRoutes)

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: '服务器正常运行' })
})

// 处理找不到的路由
app.use((req, res) => {
  res.status(404).json({ message: '未找到请求的资源' })
})

// 全局错误处理
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    message: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
})

// 获取环境变量
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_db'

// 启动服务器函数
const startServer = async () => {
  try {
    // 连接到MongoDB Atlas
    await mongoose.connect(MONGODB_URI)
    console.log('成功连接到MongoDB Atlas')

    // 检查是否需要添加初始测试数据
    const { models } = mongoose
    const userCount = (await models.User?.countDocuments({})) || 0

    if (userCount === 0) {
      console.log('数据库为空，添加测试数据...')
      // 使用动态导入替代require，解决linter错误
      const testDataModule = await import('./utils/testData')
      await testDataModule.createTestData()
      console.log('测试数据添加完成')
    } else {
      console.log(`数据库已有${userCount}个用户，跳过测试数据生成`)
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口: ${PORT}`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动服务器
startServer()
