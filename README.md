# 食谱管理系统 (Recipe Management System)

这是一个基于Vue 3和Vite构建的现代化食谱管理系统，旨在帮助用户存储、查找和管理自己喜爱的食谱。

## 项目功能

- 用户注册和登录系统
- 个人资料管理
- 添加和编辑食谱
- 按类别和标签搜索食谱
- 收藏喜爱的食谱
- 查看详细的食谱信息
- 个人食谱收藏夹

## 技术栈

### 前端

- 前端框架：Vue 3
- 构建工具：Vite
- 语言：TypeScript
- CSS预处理器：原生CSS（CSS变量）
- 状态管理：Pinia
- 路由：Vue Router
- HTTP客户端：Axios

### 后端

- 服务器框架：Express.js
- 数据库：MongoDB
- 身份验证：JWT (JSON Web Tokens)
- 密码加密：bcrypt.js
- 语言：TypeScript

## 数据库设计

系统使用MongoDB作为数据库，包含以下主要集合：

### 用户集合 (Users)

- `_id`: 用户唯一标识
- `username`: 用户名
- `email`: 电子邮箱
- `password`: 加密密码（使用bcrypt哈希）
- `avatar`: 头像URL
- `bio`: 个人简介
- `createdAt`: 创建时间

### 食谱集合 (Recipes)

- `_id`: 食谱唯一标识
- `title`: 食谱标题
- `description`: 食谱描述
- `ingredients`: 食材列表
- `steps`: 烹饪步骤
- `prepTime`: 准备时间
- `cookTime`: 烹饪时间
- `servings`: 份量
- `difficulty`: 难度
- `cuisine`: 菜系
- `category`: 分类数组
- `tags`: 标签数组
- `image`: 图片URL
- `nutrition`: 营养信息
- `author`: 作者ID（关联用户集合）
- `favorites`: 收藏用户ID列表
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## API端点

系统提供以下主要API端点：

### 用户相关

- `POST /api/users/register`: 注册新用户
- `POST /api/users/login`: 用户登录
- `GET /api/users/me`: 获取当前用户信息
- `PUT /api/users/profile`: 更新用户资料
- `PUT /api/users/change-password`: 更改密码

### 食谱相关

- `GET /api/recipes`: 获取所有食谱
- `GET /api/recipes/:id`: 获取单个食谱
- `POST /api/recipes`: 创建新食谱
- `PUT /api/recipes/:id`: 更新食谱
- `DELETE /api/recipes/:id`: 删除食谱
- `POST /api/recipes/:id/favorite`: 收藏/取消收藏食谱
- `GET /api/recipes/user/:userId`: 获取用户的食谱
- `GET /api/recipes/favorites`: 获取用户收藏的食谱

## 用户认证系统

项目实现了一个完整的用户认证系统，具备以下特性：

- **用户注册**：支持用户创建新账户，包含用户名、邮箱和密码验证
- **用户登录**：使用用户名和密码进行身份验证
- **JWT认证**：使用JSON Web Tokens进行无状态身份验证
- **密码加密**：使用bcrypt.js对密码进行安全哈希处理
- **路由守卫**：保护需要登录才能访问的页面
- **个人资料管理**：允许用户更新头像和个人信息
- **响应式设计**：在所有设备上提供一致的用户体验

演示账号：

- 用户名：demo
- 密码：password123

## 响应式设计

本项目采用了完全响应式设计，能够适配各种不同尺寸的设备：

- 移动设备（320px+）
- 平板设备（768px+）
- 桌面设备（1024px+）
- 大屏设备（1440px+）
- 超大屏幕（1920px+）

响应式技术包括：

- 弹性布局（Flexbox）和网格布局（Grid）
- 媒体查询（Media Queries）
- 相对单位（rem, em, vh, vw）
- 响应式图片和表格
- 可变字体大小（使用clamp()函数）
- 移动优先设计策略

### 大屏幕优化

针对大屏幕和超宽屏幕进行了特别优化：

- **内容容器优化**：控制内容区域的最大宽度，避免内容过度拉伸
- **两栏布局**：在大屏幕上自动切换为两栏布局，充分利用水平空间
- **增加内容密度**：添加额外内容板块（季节推荐、烹饪小贴士），减少空白区域
- **优化排版**：调整卡片大小和间距，使其在大屏幕上更加均衡
- **自适应文本**：使用clamp()函数实现不同屏幕尺寸下的最佳字体大小

## 性能优化

### 路由切换优化

为解决页面切换时可能出现的空白页面问题，我们实施了以下优化：

- **组件状态保持**：使用`<keep-alive>`包装路由视图，避免组件重新渲染
- **数据持久化**：使用MongoDB存储数据，确保数据一致性
- **Store初始化优化**：优化了Pinia Store的初始化逻辑，确保数据一致性
- **懒加载组件**：使用Vue Router的动态导入功能实现组件懒加载，减少初始加载时间
- **生命周期钩子**：在每个视图组件中使用`onMounted`钩子确保数据已加载

这些优化确保了在不同页面之间导航时的流畅体验，并消除了页面闪烁和空白页面的问题。

## 开发环境设置

推荐使用[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)进行开发（并禁用Vetur）。

### 前提条件

- Node.js >= 14.x
- npm >= 6.x
- MongoDB >= 4.4

### 安装依赖

```sh
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install
```

### 配置

在server目录下创建.env文件，设置以下环境变量：

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe_db
JWT_SECRET=recipe_management_system_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### 开发环境运行

```sh
# 启动MongoDB
# (根据您的操作系统，可能需要不同的启动命令)
# macOS: brew services start mongodb-community
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod

# 启动后端服务
cd server && npm run dev

# 在另一个终端中启动前端服务
npm run dev
```

前端应用将在 http://localhost:5174 运行（或其他可用端口）
后端API将在 http://localhost:5000 运行

### 常见问题解决

#### TypeScript类型错误

如果在启动后端服务时遇到TypeScript类型错误，特别是关于JWT或Mongoose的错误，可以尝试以下解决方案：

1. 确保安装了所有必要的类型定义包：

   ```sh
   cd server && npm install --save-dev @types/jsonwebtoken @types/mongoose
   ```

2. 对于`jwt.sign`方法的类型问题，我们在token.ts中使用了类型断言来解决：

   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   return (jwt as any).sign(payload, jwtSecret, {
     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
   })
   ```

3. 对于Mongoose ObjectId类型问题，建议使用字符串比较而非直接使用ObjectId对象：
   ```typescript
   // 使用字符串比较而不是ObjectId比较
   const isFavorited = recipe.favorites.some((id) => id.toString() === userId)
   ```

### 构建生产环境代码

```sh
# 构建前端
npm run build

# 构建后端
cd server && npm run build
```

### 使用ESLint进行代码检查

```sh
# 前端
npm run lint

# 后端
cd server && npm run lint
```

## 项目结构

```
recipe-management-system/
├── public/                     # 公共静态资源
├── server/                     # 后端代码
│   ├── src/                    # 源代码
│   │   ├── controllers/        # 控制器
│   │   ├── middleware/         # 中间件
│   │   ├── models/             # 数据模型
│   │   ├── routes/             # 路由定义
│   │   ├── utils/              # 工具函数
│   │   └── index.ts            # 入口文件
│   ├── dist/                   # 编译后的代码
│   ├── package.json            # 后端依赖
│   └── tsconfig.json           # TypeScript配置
├── src/                        # 前端代码
│   ├── assets/                 # 资源文件
│   ├── components/             # 可复用组件
│   ├── services/               # 服务层
│   │   └── api.ts              # API服务
│   ├── stores/                 # 状态管理
│   │   ├── recipe.ts           # 食谱数据存储
│   │   └── user.ts             # 用户数据存储
│   ├── types/                  # TypeScript类型定义
│   ├── views/                  # 页面组件
│   │   ├── LoginView.vue       # 用户登录页面
│   │   ├── RegisterView.vue    # 用户注册页面
│   │   ├── ProfileView.vue     # 用户资料页面
│   │   ├── HomeView.vue        # 首页
│   │   ├── RecipesView.vue     # 食谱浏览页面
│   │   ├── MyRecipesView.vue   # 我的食谱页面
│   │   ├── RecipeDetailView.vue# 食谱详情页面
│   │   ├── AddRecipeView.vue   # 添加/编辑食谱页面
│   │   ├── SearchView.vue      # 搜索页面
│   │   └── AboutView.vue       # 关于页面
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 入口文件
└── package.json                # 前端依赖
```

## 贡献指南

1. Fork本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m '添加某项功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 开发进度

- [x] 项目初始化和基础设置
- [x] 响应式布局实现
- [x] 大屏幕优化
- [x] 核心功能实现
- [x] UI/UX优化
- [x] 解决页面切换问题
- [x] 用户认证系统实现
- [x] 后端API实现
- [x] MongoDB集成
- [x] 测试
- [x] 文档完善

## 已知问题和改进建议

### 已知问题

1. **TypeScript类型错误**: 在JWT相关代码中仍存在一些TypeScript类型问题，目前通过类型断言解决。未来可考虑更优雅的解决方案。
2. **移动设备响应性**: 在某些小屏幕设备上，食谱卡片可能显示不够美观，需要进一步优化移动布局。
3. **图片上传**: 目前图片URL需手动输入，未来应添加图片上传功能。

### 改进建议

1. **高级搜索功能**: 添加更复杂的搜索条件，如按营养成分、烹饪时间等筛选食谱。
2. **用户互动**: 添加评论、点赞等社交功能，增强用户互动。
3. **离线支持**: 实现PWA(Progressive Web App)功能，支持离线访问。
4. **多语言支持**: 添加国际化(i18n)支持，使应用可以切换不同语言。
5. **食谱分享**: 添加将食谱分享到社交媒体的功能。
6. **改进数据库索引**: 优化MongoDB索引以提高查询性能。
7. **增加API缓存层**: 添加Redis缓存层减少数据库负载。
8. **食谱版本控制**: 实现食谱修改历史记录功能。
