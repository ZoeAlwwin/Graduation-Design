import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { createTestData } from './utils/testData'

// 加载环境变量
dotenv.config()

// 获取MongoDB连接URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_db'

const clearAndReloadData = async () => {
  try {
    // 连接到MongoDB
    console.log('正在连接到MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('成功连接到MongoDB')

    // 获取所有集合
    const db = mongoose.connection.db!
    console.log('数据库名称:', db.databaseName)

    // 清空用户和食谱集合
    console.log('正在清空数据库集合...')
    await mongoose.connection.collection('users').deleteMany({})
    await mongoose.connection.collection('recipes').deleteMany({})
    console.log('集合已清空')

    // 添加测试数据
    console.log('开始添加测试数据...')
    await createTestData()
    console.log('测试数据添加完成！')

    // 关闭数据库连接
    await mongoose.connection.close()
    console.log('数据库连接已关闭')

    process.exit(0)
  } catch (error) {
    console.error('操作失败:', error)
    process.exit(1)
  }
}

// 执行函数
clearAndReloadData()
