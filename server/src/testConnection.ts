import mongoose from 'mongoose'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 获取MongoDB连接URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_db'

const testConnection = async () => {
  try {
    console.log('正在测试MongoDB连接...')
    console.log(`连接地址: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`) // 隐藏用户名密码

    // 设置更长的超时时间
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10秒超时
    })

    console.log('成功连接到MongoDB!')

    // 使用非空断言运算符来避免可能为undefined的警告
    const db = mongoose.connection.db!
    console.log('数据库名称:', db.databaseName)

    // 获取集合列表
    const collections = await db.listCollections().toArray()
    console.log(
      '集合列表:',
      collections.map((c) => c.name),
    )

    // 关闭连接
    await mongoose.connection.close()
    console.log('连接已关闭')

    process.exit(0)
  } catch (error) {
    console.error('连接测试失败:', error)
    process.exit(1)
  }
}

// 执行测试
testConnection()
