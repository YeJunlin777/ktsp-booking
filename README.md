# KTSP 高尔夫预订系统

KTSP高尔夫球场预订系统，支持场地预约、教练预约、积分商城等功能。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **数据库**: MySQL + Prisma ORM
- **认证**: NextAuth.js
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并配置：

```env
DATABASE_URL="mysql://root:password@localhost:3306/ktsp_booking"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. 初始化数据库

```bash
# 创建数据库表
npx prisma migrate dev

# 生成 Prisma 客户端
npx prisma generate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/                    # 页面路由
│   ├── (main)/            # 用户端页面
│   ├── (admin)/           # 管理后台页面
│   └── api/               # API 接口
├── components/
│   ├── ui/                # shadcn/ui 组件
│   └── ...                # 业务组件
├── lib/
│   ├── db.ts              # 数据库连接
│   ├── auth.ts            # 认证配置
│   ├── api.ts             # 前端 API 封装
│   ├── response.ts        # API 响应格式
│   ├── session.ts         # Session 工具
│   └── utils/             # 工具函数
├── types/
│   ├── api.ts             # API 类型定义
│   └── next-auth.d.ts     # NextAuth 类型扩展
└── hooks/                 # 自定义 Hooks
```

## 数据库表

| 模块 | 表名 | 说明 |
|------|------|------|
| 用户 | users, accounts, sessions | 用户、OAuth、会话 |
| 场地 | venues, time_slots | 场地、时段价格 |
| 预约 | bookings | 预约订单 |
| 教练 | coaches, coach_schedules | 教练、排班 |
| 课程 | courses | 团体课程 |
| 积分 | checkins, point_logs, products, product_orders | 签到、积分、商城 |
| 营销 | coupons | 优惠码 |
| 系统 | admins, settings, banners, messages | 管理员、配置、消息 |

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产启动
npm start

# 数据库迁移
npx prisma migrate dev

# 查看数据库
npx prisma studio

# 类型检查
npm run lint
```

## API 响应格式

```typescript
// 成功
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "pageSize": 10, "total": 100 }
}

// 失败
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "请先登录"
  }
}
```

## 开发人员

- A同学（后端）: 数据库 + API
- B同学（前端）: 页面 + 交互

## License

Private
