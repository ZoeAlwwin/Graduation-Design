import User from '../models/User'
import Recipe from '../models/Recipe'

/**
 * 创建测试数据
 */
export const createTestData = async (): Promise<void> => {
  try {
    // 创建demo用户
    const demoUser = await User.create({
      username: 'demo',
      email: 'demo@example.com',
      password: 'password123',
      avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      bio: '这是一个演示账号',
      createdAt: new Date(),
    })

    // 创建admin用户
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      avatar: 'https://www.gravatar.com/avatar/5a60b4ffd34d0e1b4595c75f92af0d32?d=mp&f=y',
      bio: '管理员账号，拥有所有权限',
      createdAt: new Date(),
    })

    // 创建测试食谱
    const recipes = [
      {
        title: '红烧肉',
        description: '经典的中式红烧肉，肥而不腻，香甜可口。',
        ingredients: [
          '五花肉 500克',
          '生姜 2片',
          '大葱 1根',
          '料酒 2勺',
          '生抽 2勺',
          '老抽 1勺',
          '冰糖 适量',
        ],
        steps: [
          '五花肉切成大块，焯水去血水和杂质',
          '锅中放油，放入冰糖小火熬至融化成糖色',
          '放入肉块翻炒至均匀上色',
          '加入料酒、生抽、老抽、姜片和大葱',
          '加入没过肉的热水，大火烧开后转小火炖1小时',
          '收汁后即可出锅',
        ],
        prepTime: 15,
        cookTime: 60,
        servings: 4,
        difficulty: 'medium',
        cuisine: '中式',
        category: ['肉类', '红烧'],
        tags: ['猪肉', '家常菜', '下饭菜'],
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 450,
          fat: 30,
          carbs: 10,
          protein: 35,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '番茄炒蛋',
        description: '简单美味的家常菜，酸甜可口，老少皆宜。',
        ingredients: ['西红柿 2个', '鸡蛋 3个', '葱花 适量', '盐 适量', '糖 1小勺', '食用油 适量'],
        steps: [
          '西红柿洗净切块，鸡蛋打散',
          '锅中热油，倒入鸡蛋液炒至凝固，盛出',
          '锅中重新热油，倒入西红柿块炒出汁',
          '加入适量盐和糖调味',
          '倒入炒好的鸡蛋，翻炒均匀',
          '撒上葱花出锅',
        ],
        prepTime: 5,
        cookTime: 10,
        servings: 2,
        difficulty: 'easy',
        cuisine: '中式',
        category: ['家常菜', '快手菜'],
        tags: ['鸡蛋', '西红柿', '10分钟'],
        image:
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 180,
          fat: 12,
          carbs: 8,
          protein: 15,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '宫保鸡丁',
        description: '四川名菜，鸡肉和花生的完美结合，麻辣鲜香。',
        ingredients: [
          '鸡胸肉 300克',
          '黄瓜 半根',
          '花生米 50克',
          '干辣椒 6~8个',
          '花椒 1小勺',
          '姜蒜 适量',
          '料酒 1勺',
          '生抽 1勺',
          '醋 半勺',
          '糖 1小勺',
        ],
        steps: [
          '鸡胸肉切丁，用盐、料酒、淀粉腌制10分钟',
          '黄瓜切丁，花生米提前炒熟',
          '干辣椒剪段，姜蒜切末',
          '热锅冷油，放入干辣椒和花椒炒香',
          '放入姜蒜末爆香，然后放入鸡丁翻炒至变色',
          '加入生抽、醋、糖调味',
          '放入黄瓜丁和花生米翻炒均匀即可出锅',
        ],
        prepTime: 15,
        cookTime: 10,
        servings: 2,
        difficulty: 'medium',
        cuisine: '川菜',
        category: ['家常菜', '炒菜'],
        tags: ['鸡肉', '辣', '下饭'],
        image:
          'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 320,
          fat: 18,
          carbs: 12,
          protein: 29,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '水煮鱼',
        description: '四川传统名菜，麻辣鲜香，让人回味无穷。',
        ingredients: [
          '草鱼 1条（约500克）',
          '豆芽 200克',
          '干辣椒 10个',
          '花椒 1勺',
          '姜片 5片',
          '蒜片 8片',
          '料酒 2勺',
          '生抽 1勺',
          '郫县豆瓣酱 2勺',
          '淀粉 适量',
        ],
        steps: [
          '草鱼去鳞去内脏，切片，用盐、料酒、淀粉腌制10分钟',
          '豆芽焯水后铺在锅底',
          '锅中热油，炒香干辣椒、花椒、姜片和蒜片',
          '加入豆瓣酱炒出红油',
          '加入适量清水煮开',
          '将鱼片放入锅中，用勺子舀汤汁浇在鱼片上',
          '鱼片变色后关火，浇上热油即可',
        ],
        prepTime: 20,
        cookTime: 15,
        servings: 3,
        difficulty: 'medium',
        cuisine: '川菜',
        category: ['家常菜', '水煮'],
        tags: ['鱼', '麻辣', '下饭'],
        image:
          'https://images.unsplash.com/photo-1511176118080-4a856f029ca3?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 280,
          fat: 14,
          carbs: 5,
          protein: 32,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '糖醋排骨',
        description: '外酥里嫩，酸甜可口的传统名菜。',
        ingredients: [
          '猪小排 500克',
          '白醋 2勺',
          '白糖 3勺',
          '番茄酱 2勺',
          '生抽 1勺',
          '姜片 3片',
          '料酒 1勺',
          '淀粉 适量',
          '香葱 适量',
        ],
        steps: [
          '排骨切段，用冷水浸泡30分钟去血水',
          '锅中放油，放入排骨煎至两面金黄',
          '加入姜片、料酒、生抽翻炒',
          '加入适量水没过排骨，大火煮开后转小火炖15分钟',
          '加入白醋、白糖、番茄酱调味',
          '大火收汁，汁液浓稠后关火',
          '撒上香葱即可出锅',
        ],
        prepTime: 40,
        cookTime: 25,
        servings: 3,
        difficulty: 'medium',
        cuisine: '中式',
        category: ['肉类', '糖醋'],
        tags: ['排骨', '酸甜', '下饭'],
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 420,
          fat: 28,
          carbs: 15,
          protein: 30,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '麻婆豆腐',
        description: '四川传统名菜，麻辣鲜香，豆腐嫩滑。',
        ingredients: [
          '豆腐 1盒',
          '猪肉末 100克',
          '郫县豆瓣酱 2勺',
          '花椒面 1小勺',
          '干辣椒面 1小勺',
          '蒜末 1勺',
          '姜末 1勺',
          '葱花 适量',
          '生抽 1勺',
          '水淀粉 适量',
        ],
        steps: [
          '豆腐切成小方块，用盐水浸泡10分钟',
          '锅中放油，爆香姜末、蒜末',
          '放入肉末炒散',
          '加入豆瓣酱炒出红油',
          '倒入适量清水，放入豆腐块',
          '小火煮5分钟，加入生抽调味',
          '用水淀粉勾芡，撒上花椒面、辣椒面和葱花即可',
        ],
        prepTime: 15,
        cookTime: 10,
        servings: 2,
        difficulty: 'easy',
        cuisine: '川菜',
        category: ['家常菜', '烩菜'],
        tags: ['豆腐', '麻辣', '下饭'],
        image:
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 220,
          fat: 15,
          carbs: 8,
          protein: 18,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '鱼香肉丝',
        description: '川菜经典，酸甜辣咸完美结合。',
        ingredients: [
          '猪里脊肉 300克',
          '胡萝卜 半根',
          '青椒 1个',
          '木耳 30克',
          '姜末 1勺',
          '蒜末 1勺',
          '葱花 适量',
          '郫县豆瓣酱 1勺',
          '白糖 1勺',
          '醋 1勺',
          '生抽 1勺',
          '淀粉 适量',
        ],
        steps: [
          '猪肉切丝，用盐、淀粉、料酒腌制10分钟',
          '胡萝卜、青椒切丝，木耳泡发切丝',
          '锅中热油，放入肉丝翻炒至变色',
          '加入姜末、蒜末和豆瓣酱炒香',
          '加入胡萝卜丝、青椒丝和木耳丝翻炒',
          '加入白糖、醋、生抽调味',
          '用水淀粉勾芡，撒上葱花即可',
        ],
        prepTime: 20,
        cookTime: 10,
        servings: 2,
        difficulty: 'medium',
        cuisine: '川菜',
        category: ['家常菜', '炒菜'],
        tags: ['猪肉', '酸辣', '下饭'],
        image:
          'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 280,
          fat: 16,
          carbs: 15,
          protein: 24,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '清蒸鲈鱼',
        description: '鲜美清淡，保留食材原味的健康菜品。',
        ingredients: [
          '鲈鱼 1条（约500克）',
          '姜片 5片',
          '葱段 3段',
          '蒸鱼豉油 2勺',
          '料酒 1勺',
          '盐 适量',
          '香葱丝 适量',
          '香菜 适量',
        ],
        steps: [
          '鲈鱼去鳞去内脏，洗净沥干水分',
          '鱼身两面各划几刀，腌入少许盐和料酒10分钟',
          '盘中铺上部分姜片和葱段',
          '将鱼放在姜葱上，鱼肚内放入剩余姜片和葱段',
          '上锅蒸8-10分钟至鱼肉熟透',
          '取出鱼，倒掉汤汁，淋上热油和蒸鱼豉油',
          '撒上香葱丝和香菜即可',
        ],
        prepTime: 15,
        cookTime: 10,
        servings: 2,
        difficulty: 'easy',
        cuisine: '粤菜',
        category: ['家常菜', '蒸菜'],
        tags: ['鱼', '清淡', '健康'],
        image:
          'https://images.unsplash.com/photo-1511176118080-4a856f029ca3?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 220,
          fat: 10,
          carbs: 2,
          protein: 32,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '西红柿牛腩汤',
        description: '营养丰富，酸甜开胃的家常汤品。',
        ingredients: [
          '牛腩 300克',
          '西红柿 2个',
          '土豆 1个',
          '胡萝卜 半根',
          '洋葱 半个',
          '姜片 3片',
          '大蒜 2瓣',
          '番茄酱 1勺',
          '盐 适量',
          '黑胡椒 适量',
          '香菜 适量',
        ],
        steps: [
          '牛腩切块，焯水去血水',
          '西红柿、土豆、胡萝卜、洋葱切块',
          '锅中热油，炒香姜片和大蒜',
          '加入牛腩翻炒至变色',
          '加入番茄酱炒匀',
          '加入足够的清水，大火煮开后转小火炖1小时',
          '加入土豆、胡萝卜和洋葱继续炖30分钟',
          '最后加入西红柿煮5分钟',
          '加盐和黑胡椒调味，撒上香菜即可',
        ],
        prepTime: 20,
        cookTime: 100,
        servings: 4,
        difficulty: 'medium',
        cuisine: '中式',
        category: ['汤品', '炖菜'],
        tags: ['牛肉', '番茄', '暖胃'],
        image:
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 320,
          fat: 12,
          carbs: 25,
          protein: 32,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '蒜蓉蒸虾',
        description: '鲜美多汁，蒜香四溢的海鲜佳肴。',
        ingredients: [
          '鲜虾 500克',
          '蒜末 3勺',
          '葱花 适量',
          '姜末 1勺',
          '料酒 1勺',
          '盐 适量',
          '食用油 2勺',
        ],
        steps: [
          '鲜虾洗净，剪去虾须',
          '虾背划开，取出虾线',
          '虾身涂抹一层盐和料酒腌制5分钟',
          '将蒜末、姜末混合，均匀铺在虾上',
          '上锅蒸5-6分钟至虾肉变透明',
          '取出后淋上热油和葱花即可',
        ],
        prepTime: 15,
        cookTime: 6,
        servings: 3,
        difficulty: 'easy',
        cuisine: '粤菜',
        category: ['海鲜', '蒸菜'],
        tags: ['虾', '蒜香', '鲜美'],
        image:
          'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 220,
          fat: 8,
          carbs: 5,
          protein: 30,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: '可乐鸡翅',
        description: '甜中带咸，色泽红亮，肉质鲜嫩多汁。',
        ingredients: [
          '鸡翅中 10个',
          '可乐 1罐',
          '姜片 3片',
          '葱段 2段',
          '料酒 1勺',
          '生抽 1勺',
          '老抽 半勺',
          '盐 适量',
        ],
        steps: [
          '鸡翅洗净，用牙签扎几个小孔',
          '锅中热油，放入鸡翅煎至两面金黄',
          '加入姜片、葱段炒香',
          '倒入可乐、料酒、生抽、老抽',
          '大火烧开后转小火炖15分钟',
          '翻面继续炖10分钟至汤汁浓稠',
          '加盐调味即可出锅',
        ],
        prepTime: 10,
        cookTime: 30,
        servings: 3,
        difficulty: 'easy',
        cuisine: '中式',
        category: ['家常菜', '卤菜'],
        tags: ['鸡肉', '甜味', '下酒菜'],
        image:
          'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=60',
        nutrition: {
          calories: 380,
          fat: 22,
          carbs: 20,
          protein: 26,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // 创建测试食谱并关联到用户
    const createdRecipes = await Promise.all(
      recipes.map((recipe, index) => {
        // 将食谱分配给不同的用户
        const author = index < 4 ? demoUser : adminUser
        const favoriteUser = index < 4 ? adminUser : demoUser
        return Recipe.create({
          ...recipe,
          author: author._id,
          favorites: [favoriteUser._id], // 让另一个用户收藏这个食谱
        })
      }),
    )
    console.log('测试食谱创建成功：', createdRecipes.length, '个')

    // 更新用户的食谱和收藏
    await Promise.all(
      [demoUser, adminUser].map(async (user) => {
        // @ts-expect-error - user._id is definitely a mongoose ObjectId
        const userId = user._id.toString()
        // 获取该用户创建的食谱
        const userRecipes = createdRecipes.filter((recipe) => recipe.author.toString() === userId)
        // 获取该用户收藏的食谱
        const userFavorites = createdRecipes.filter((recipe) =>
          recipe.favorites.some((favId) => favId.toString() === userId),
        )

        // 更新用户的食谱和收藏
        await User.findByIdAndUpdate(userId, {
          recipes: userRecipes.map((recipe) => recipe._id),
          favoriteRecipes: userFavorites.map((recipe) => recipe._id),
        })
      }),
    )

    console.log(`已创建测试用户: ${demoUser.username}, ${adminUser.username}`)
    console.log(`已创建${recipes.length}条测试食谱数据`)
  } catch (error) {
    console.error('创建测试数据失败:', error)
    throw error // 重新抛出错误以便上层函数捕获
  }
}
