# BusinessScope - Next.js + Vercel 详细开发任务清单

## 📋 任务追踪说明

- ✅ **已完成** 
- 🔄 **进行中**
- ⏸️ **暂停/阻塞**
- ⏭️ **待开始**
- 🔴 **高优先级**
- 🟡 **中优先级**  
- 🟢 **低优先级**

---

## 🚀 第一阶段：MVP开发（4-6周）

### 📅 第1周：项目初始化与环境搭建

#### Day 1-2：Vercel环境准备（8小时）🔴
- [x] **任务1.1** 注册Vercel账号并连接GitHub✅
  - [x] 注册Vercel账号
  - [x] 连接GitHub账号授权
  - [x] 了解Vercel免费版限制
  - **时间预估**: 1小时
  - **验收标准**: Vercel可以访问GitHub仓库

- [x] **任务1.2** 创建Next.js项目✅
  - [x] 使用create-next-app创建项目
  ```bash
  npx create-next-app@latest businessscope \
    --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
  - [x] 初始化Git仓库并推送到GitHub
  - [x] 验证项目结构正确
  - **时间预估**: 2小时
  - **验收标准**: Next.js项目可以本地运行
  - **实际完成时间**: 2024年12月 (已完成项目创建、结构验证、本地运行测试)

- [x] **任务1.3** Vercel项目部署配置✅
  - [x] 在Vercel导入GitHub项目
  - [x] 配置自动部署设置
  - [x] 测试部署流程
  - [x] 获取项目访问域名
  - **时间预估**: 2小时
  - **验收标准**: 项目自动部署成功，可以在线访问
  - **项目访问地址**: https://business-point-system.vercel.app/
  - **实际完成时间**: 2025年7月 (部署成功，自动部署配置完成)

- [x] **任务1.4** 数据库服务创建✅
  - [x] 创建Vercel Postgres数据库
  - [x] 创建Vercel KV存储  
  - [x] 配置环境变量
  - [x] 测试数据库连接
  - **时间预估**: 3小时
  - **验收标准**: 数据库服务正常运行
  - **实际完成时间**: 2025年7月 (PostgreSQL + Supabase连接成功，Upstash Redis双方式连接测试通过)
  - **技术栈**: 
    - PostgreSQL (Supabase) - 主数据库
    - Redis (Upstash) - 缓存和会话存储，支持REST API和IORedis两种连接方式
    - 已安装依赖: pg, @types/pg, @upstash/redis, ioredis, @types/ioredis

#### Day 3-5：项目基础架构（15小时）🔴

- [x] **任务2.1** 核心依赖安装与配置✅
  ```bash
  # 数据库相关
  npm install @vercel/postgres @vercel/kv prisma @prisma/client
  
  # 认证相关
  npm install next-auth @auth/prisma-adapter
  
  # UI组件
  npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
  
  # 表单处理
  npm install react-hook-form @hookform/resolvers zod
  
  # 状态管理
  npm install zustand
  
  # 图标和图表
  npm install lucide-react recharts
  
  # 开发工具
  npm install --save-dev @types/node tsx
  ```
  - **时间预估**: 3小时
  - **验收标准**: 所有依赖正确安装
  - **实际完成时间**: 2025年7月 (所有核心依赖安装完毕，构建测试通过)
  - **已安装包列表**:
    - 数据库: @vercel/postgres, @vercel/kv, prisma, @prisma/client
    - 认证: next-auth, @auth/prisma-adapter  
    - UI组件: @radix-ui/react-*, class-variance-authority, clsx, tailwind-merge
    - 表单: react-hook-form, @hookform/resolvers, zod
    - 状态管理: zustand
    - 图标图表: lucide-react, recharts
    - 开发工具: @types/node, tsx

- [x] **任务2.2** shadcn/ui组件库初始化✅
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button card input label form
  npx shadcn@latest add table pagination dropdown-menu
  npx shadcn@latest add avatar badge dialog sheet tabs
  npx shadcn@latest add select textarea checkbox
  ```
  - [x] 配置组件主题
  - [x] 测试基础组件
  - **时间预估**: 4小时
  - **验收标准**: UI组件库可正常使用
  - **实际完成时间**: 2025年7月 (shadcn/ui初始化完成，16个组件安装成功)
  - **配置详情**:
    - 主题: new-york 风格，neutral 基础色彩
    - 组件数量: 16个核心UI组件
    - 测试页面: /test-ui (构建测试通过)
    - 配置文件: components.json, 支持TypeScript和RSC
  - **已安装组件**: button, card, input, label, form, select, textarea, checkbox, table, pagination, dropdown-menu, avatar, badge, dialog, sheet, tabs

- [x] **任务2.3** 项目结构优化✅
  ```
  src/
  ├── app/
  │   ├── (auth)/              # 认证相关页面组
  │   │   ├── signin/
  │   │   └── signup/
  │   ├── (dashboard)/         # 用户面板页面组
  │   │   ├── dashboard/
  │   │   └── bookmarks/
  │   ├── api/                 # API Routes
  │   │   ├── auth/
  │   │   ├── opportunities/
  │   │   ├── user/
  │   │   ├── search/
  │   │   └── webhooks/
  │   ├── opportunities/       # 机会相关页面
  │   ├── test-ui/             # 组件测试页面
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/
  │   ├── ui/                  # shadcn/ui组件 (16个组件)
  │   ├── features/            # 业务组件
  │   │   ├── auth/            # 认证组件
  │   │   ├── opportunities/   # 机会相关组件
  │   │   └── dashboard/       # 仪表板组件
  │   └── layout/              # 布局组件
  ├── lib/
  │   ├── db.ts                # 数据库连接
  │   ├── redis.ts             # Redis连接
  │   └── utils.ts             # 工具函数 (shadcn)
  ├── store/
  │   └── index.ts             # Zustand状态管理
  └── types/
      └── index.ts             # TypeScript类型定义
  ```
  - **时间预估**: 2小时
  - **验收标准**: 项目结构清晰，易于维护
  - **实际完成时间**: 2025年7月 (完整项目结构创建，构建测试通过)
  - **结构特点**:
    - 采用App Router路由组结构
    - 业务组件按功能模块分组
    - 完整的TypeScript类型系统
    - Zustand状态管理配置
    - 符合Next.js 15最佳实践

- [x] **任务2.4** TypeScript类型定义✅
  ```typescript
  // src/types/index.ts
  export interface RawContent {
    id: string
    platform: Platform
    originalUrl?: string
    title?: string
    content?: string
    author?: string
    publishedAt?: Date
    collectedAt: Date
    likesCount: number
    sharesCount: number
    commentsCount: number
    viewCount: number
    tags?: string
    status: ContentStatus
    createdAt: Date
    updatedAt: Date
  }
  
  export interface AIAnalysis {
    id: string
    contentId: string
    sentimentLabel?: SentimentLabel
    sentimentScore?: number
    mainTopic?: string
    keywords?: string[]
    businessRate?: number
    contentRate?: number
    finalRate?: FinalRate
    reason?: string
    confidence?: number
    analyzedAt: Date
    createdAt: Date
    updatedAt: Date
  }
  
  export interface User {
    id: string
    email: string
    name?: string
    image?: string
    subscriptionType: SubscriptionType
    dailyUsageCount: number
    monthlyUsageCount: number
    usageLimit: number
    lastActiveAt?: Date
    createdAt: Date
    updatedAt: Date
  }
  ```
  - **时间预估**: 3小时
  - **验收标准**: 类型定义完整，编译无错误
  - **实际完成时间**: 2025年7月 (完整TypeScript类型系统构建成功)
  - **类型系统特色**:
    - 17个核心业务接口定义
    - 5个类型枚举 (Platform, ContentStatus, FinalRate等)
    - 完整的Zod验证schemas (13个表单验证)
    - 类型安全的API响应结构
    - 扩展的NextAuth会话类型
    - 统计和分析相关类型
  - **验证文件**: 
    - src/types/index.ts - 核心类型定义
    - src/lib/validations.ts - Zod验证schemas
    - /test-types - 类型系统测试页面

- [ ] **任务2.5** 环境变量配置⏭️
  ```bash
  # .env.local
  POSTGRES_PRISMA_URL=""
  POSTGRES_URL_NON_POOLING=""
  KV_REST_API_URL=""
  KV_REST_API_TOKEN=""
  NEXTAUTH_SECRET=""
  NEXTAUTH_URL=""
  GOOGLE_CLIENT_ID=""
  GOOGLE_CLIENT_SECRET=""
  GEMINI_API_KEY=""
  ```
  - [ ] 在Vercel项目设置中配置环境变量
  - [ ] 本地开发环境变量配置
  - **时间预估**: 3小时
  - **验收标准**: 环境变量在本地和生产环境都正确配置

#### Day 6-7：数据库设计与Prisma配置（12小时）🔴

- [ ] **任务3.1** Prisma Schema设计⏭️
  ```prisma
  // prisma/schema.prisma
  generator client {
    provider = "prisma-client-js"
  }
  
  datasource db {
    provider = "postgresql"
    url = env("POSTGRES_PRISMA_URL")
  }
  
  model RawContent {
    id            String   @id @default(cuid())
    platform      String   
    originalUrl   String?  @map("original_url")
    title         String?
    content       String?
    author        String?
    publishedAt   DateTime? @map("published_at")
    collectedAt   DateTime @default(now()) @map("collected_at")
    likesCount    Int      @default(0) @map("likes_count")
    sharesCount   Int      @default(0) @map("shares_count")
    commentsCount Int      @default(0) @map("comments_count")
    viewCount     Int      @default(0) @map("view_count")
    tags          String?
    status        String   @default("待处理")
    
    analysis      AIAnalysis?
    bookmarks     Bookmark[]
    
    @@map("raw_content")
  }
  
  // ... 其他模型定义
  ```
  - **时间预估**: 6小时
  - **验收标准**: Schema设计完整，关系正确

- [ ] **任务3.2** 数据库迁移执行⏭️
  ```bash
  npx prisma generate
  npx prisma db push
  npx prisma studio
  ```
  - [ ] 执行数据库迁移
  - [ ] 验证表结构创建
  - [ ] 使用Prisma Studio检查数据库
  - **时间预估**: 3小时
  - **验收标准**: 数据库表创建成功

- [ ] **任务3.3** 数据库操作封装⏭️
  ```typescript
  // src/lib/db.ts
  import { PrismaClient } from '@prisma/client'
  
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }
  
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
  - [ ] 创建数据库连接实例
  - [ ] 封装常用查询方法
  - [ ] 测试数据库操作
  - **时间预估**: 3小时
  - **验收标准**: 数据库操作正常

### 📅 第2周：认证系统与API开发

#### Day 8-10：NextAuth.js认证系统（15小时）🔴

- [ ] **任务4.1** NextAuth.js基础配置⏭️
  ```typescript
  // src/lib/auth.ts
  import { NextAuthOptions } from "next-auth"
  import { PrismaAdapter } from "@auth/prisma-adapter"
  import CredentialsProvider from "next-auth/providers/credentials"
  import GoogleProvider from "next-auth/providers/google"
  import { prisma } from "./db"
  
  export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        // 邮箱密码登录配置
      }),
      GoogleProvider({
        // Google OAuth配置
      }),
    ],
    session: {
      strategy: "jwt",
    },
    // ... 其他配置
  }
  ```
  - **时间预估**: 6小时
  - **验收标准**: NextAuth配置正确

- [ ] **任务4.2** API Routes认证接口⏭️
  ```typescript
  // src/app/api/auth/[...nextauth]/route.ts
  import NextAuth from "next-auth"
  import { authOptions } from "@/lib/auth"
  
  const handler = NextAuth(authOptions)
  export { handler as GET, handler as POST }
  
  // src/app/api/auth/register/route.ts
  export async function POST(request: Request) {
    // 用户注册逻辑
  }
  ```
  - **时间预估**: 5小时
  - **验收标准**: 用户可以注册和登录

- [ ] **任务4.3** 认证中间件和保护路由⏭️
  ```typescript
  // middleware.ts
  import { withAuth } from "next-auth/middleware"
  
  export default withAuth({
    pages: {
      signIn: "/signin",
    },
  })
  
  export const config = {
    matcher: ["/dashboard/:path*", "/api/protected/:path*"]
  }
  ```
  - **时间预估**: 4小时
  - **验收标准**: 受保护的路由需要登录才能访问

#### Day 11-14：核心API Routes开发（20小时）🔴

- [ ] **任务5.1** 商业机会API开发⏭️
  ```typescript
  // src/app/api/opportunities/route.ts
  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const platform = searchParams.get('platform')
    
    // 分页查询逻辑
  }
  
  // src/app/api/opportunities/[id]/route.ts
  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    // 获取单个机会详情
  }
  
  // src/app/api/opportunities/trending/route.ts
  export async function GET(request: Request) {
    // 获取趋势分析数据
  }
  ```
  - **时间预估**: 8小时
  - **验收标准**: API返回正确格式的数据

- [ ] **任务5.2** 用户相关API开发⏭️
  ```typescript
  // src/app/api/user/profile/route.ts
  export async function GET(request: Request) {
    // 获取用户信息
  }
  
  export async function PUT(request: Request) {
    // 更新用户信息
  }
  
  // src/app/api/user/bookmarks/route.ts
  export async function GET(request: Request) {
    // 获取用户收藏
  }
  
  export async function POST(request: Request) {
    // 添加收藏
  }
  
  // src/app/api/user/usage/route.ts
  export async function GET(request: Request) {
    // 获取使用统计
  }
  ```
  - **时间预估**: 6小时
  - **验收标准**: 用户功能API正常工作

- [ ] **任务5.3** 搜索和筛选API⏭️
  ```typescript
  // src/app/api/search/route.ts
  export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const filters = {
      platform: searchParams.get('platform'),
      dateRange: searchParams.get('dateRange'),
      minScore: searchParams.get('minScore')
    }
    
    // 搜索和筛选逻辑
  }
  ```
  - **时间预估**: 4小时
  - **验收标准**: 搜索功能正确返回结果

- [ ] **任务5.4** Webhook接收API（n8n集成）⏭️
  ```typescript
  // src/app/api/webhooks/n8n/route.ts
  export async function POST(request: Request) {
    const data = await request.json()
    
    // 验证请求来源
    // 数据验证和清洗
    // 写入数据库
    // 触发AI分析
  }
  ```
  - **时间预估**: 2小时
  - **验收标准**: 可以接收n8n推送的数据

### 📅 第3周：前端页面开发

#### Day 15-17：核心页面组件开发（18小时）🔴

- [ ] **任务6.1** 布局组件开发⏭️
  ```typescript
  // src/components/layout/header.tsx
  export function Header() {
    // 顶部导航栏
    // 用户头像和菜单
    // 搜索框
  }
  
  // src/components/layout/sidebar.tsx
  export function Sidebar() {
    // 侧边栏导航
    // 筛选器
  }
  
  // src/app/layout.tsx
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="zh-CN">
        <body>
          <Header />
          <main>{children}</main>
        </body>
      </html>
    )
  }
  ```
  - **时间预估**: 6小时
  - **验收标准**: 布局组件响应式，交互良好

- [ ] **任务6.2** 首页开发⏭️
  ```typescript
  // src/app/page.tsx
  export default function HomePage() {
    return (
      <div>
        <HeroSection />
        <FeatureHighlights />
        <LatestOpportunities />
        <TrendingTopics />
      </div>
    )
  }
  
  // src/components/features/opportunities/opportunity-card.tsx
  export function OpportunityCard({ opportunity }: { opportunity: RawContent }) {
    // 机会卡片组件
    // 显示标题、摘要、评分等
    // 收藏、分享按钮
  }
  ```
  - **时间预估**: 8小时
  - **验收标准**: 首页可以展示最新机会

- [ ] **任务6.3** 认证页面开发⏭️
  ```typescript
  // src/app/(auth)/signin/page.tsx
  export default function SignInPage() {
    return (
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    )
  }
  
  // src/components/features/auth/signin-form.tsx
  export function SignInForm() {
    const form = useForm<SignInFormData>({
      resolver: zodResolver(signInSchema),
    })
    
    // 表单处理逻辑
    // 错误处理
    // 成功跳转
  }
  ```
  - **时间预估**: 4小时
  - **验收标准**: 用户可以登录注册

#### Day 18-21：功能页面开发（17小时）🔴

- [ ] **任务7.1** 机会列表页面⏭️
  ```typescript
  // src/app/opportunities/page.tsx
  export default function OpportunitiesPage() {
    return (
      <div>
        <FilterPanel />
        <OpportunitiesList />
        <Pagination />
      </div>
    )
  }
  
  // src/components/features/opportunities/filter-panel.tsx
  export function FilterPanel() {
    // 平台筛选
    // 时间范围筛选
    // 评分筛选
    // 关键词筛选
  }
  ```
  - **时间预估**: 8小时
  - **验收标准**: 列表页支持筛选和分页

- [ ] **任务7.2** 机会详情页面⏭️
  ```typescript
  // src/app/opportunities/[id]/page.tsx
  export default function OpportunityDetailPage({
    params
  }: {
    params: { id: string }
  }) {
    return (
      <div>
        <OpportunityHeader />
        <AIAnalysisSection />
        <RelatedOpportunities />
        <ActionButtons />
      </div>
    )
  }
  ```
  - **时间预估**: 6小时
  - **验收标准**: 详情页完整展示分析结果

- [ ] **任务7.3** 用户面板页面⏭️
  ```typescript
  // src/app/(dashboard)/dashboard/page.tsx
  export default function DashboardPage() {
    return (
      <div>
        <StatsOverview />
        <RecentActivity />
        <UsageChart />
        <BookmarksList />
      </div>
    )
  }
  ```
  - **时间预估**: 3小时
  - **验收标准**: 用户可以查看个人数据

### 📅 第4周：功能完善与集成测试

#### Day 22-25：状态管理与数据流（12小时）🟡

- [ ] **任务8.1** Zustand状态管理配置⏭️
  ```typescript
  // src/store/index.ts
  import { create } from 'zustand'
  import { persist } from 'zustand/middleware'
  
  interface AppState {
    user: User | null
    opportunities: RawContent[]
    filters: FilterState
    setUser: (user: User | null) => void
    setOpportunities: (opportunities: RawContent[]) => void
    updateFilters: (filters: Partial<FilterState>) => void
  }
  
  export const useAppStore = create<AppState>()(
    persist(
      (set, get) => ({
        // 状态和方法定义
      }),
      {
        name: 'app-storage',
      }
    )
  )
  ```
  - **时间预估**: 4小时
  - **验收标准**: 状态管理正常工作

- [ ] **任务8.2** API调用封装⏭️
  ```typescript
  // src/lib/api.ts
  class ApiClient {
    async getOpportunities(params: QueryParams) {
      // API调用封装
    }
    
    async getOpportunity(id: string) {
      // 单个机会获取
    }
    
    async bookmarkOpportunity(id: string) {
      // 收藏操作
    }
    
    async searchOpportunities(query: string, filters: FilterState) {
      // 搜索功能
    }
  }
  
  export const api = new ApiClient()
  ```
  - **时间预估**: 4小时
  - **验收标准**: API调用统一管理

- [ ] **任务8.3** 错误处理和加载状态⏭️
  ```typescript
  // src/components/ui/loading-spinner.tsx
  export function LoadingSpinner() {
    // 加载动画组件
  }
  
  // src/components/ui/error-boundary.tsx
  export function ErrorBoundary({ children }: { children: React.ReactNode }) {
    // 错误边界处理
  }
  
  // src/hooks/use-api.ts
  export function useApi<T>(apiCall: () => Promise<T>) {
    // 自定义Hook处理加载状态和错误
  }
  ```
  - **时间预估**: 4小时
  - **验收标准**: 用户体验良好，错误处理完善

#### Day 26-28：n8n集成与测试（13小时）🔴

- [ ] **任务9.1** n8n工作流修改⏭️
  - [ ] 修改收集原始内容工作流
  - [ ] 将Google Sheets节点替换为HTTP请求节点
  - [ ] 配置请求头和认证
  - [ ] 测试数据推送
  - **时间预估**: 6小时
  - **验收标准**: n8n可以向Next.js API推送数据

- [ ] **任务9.2** 数据同步测试⏭️
  - [ ] 验证数据格式正确性
  - [ ] 测试大批量数据处理
  - [ ] 检查错误处理机制
  - [ ] 监控数据质量
  - **时间预估**: 4小时
  - **验收标准**: 数据同步稳定可靠

- [ ] **任务9.3** 端到端测试⏭️
  - [ ] 完整用户流程测试
  - [ ] 各设备兼容性测试
  - [ ] 性能压力测试
  - [ ] 安全性测试
  - **时间预估**: 3小时
  - **验收标准**: 系统整体稳定运行

#### Day 29-30：优化与部署（10小时）🔴

- [ ] **任务10.1** 性能优化⏭️
  - [ ] 代码分割和懒加载
  - [ ] 图片优化（Next.js Image组件）
  - [ ] 数据库查询优化
  - [ ] 缓存策略实施
  - **时间预估**: 6小时
  - **验收标准**: 页面加载速度<3秒

- [ ] **任务10.2** SEO优化⏭️
  - [ ] 元数据配置
  - [ ] 结构化数据
  - [ ] sitemap生成
  - [ ] robots.txt配置
  - **时间预估**: 2小时
  - **验收标准**: SEO得分>90

- [ ] **任务10.3** 生产环境验证⏭️
  - [ ] 环境变量检查
  - [ ] 域名配置（如果需要）
  - [ ] 监控配置
  - [ ] 备份策略
  - **时间预估**: 2小时
  - **验收标准**: 生产环境稳定运行

---

## 📊 技术栈优势

### 🚀 开发效率提升
- **全栈框架**: 前后端统一，减少配置时间
- **零配置部署**: Git推送自动部署
- **类型安全**: TypeScript + Prisma全流程类型安全
- **现代UI**: shadcn/ui提供高质量组件

### 💰 成本控制
- **前期零成本**: Vercel免费版足够MVP使用
- **按需扩展**: 用户增长后再付费升级
- **无服务器维护**: 专注业务逻辑开发

### 🔧 开发体验
- **热重载**: 开发时实时预览
- **边缘计算**: 全球CDN加速
- **数据库工具**: Prisma Studio可视化管理
- **一键部署**: 无需复杂CI/CD配置

### 📈 扩展性
- **无服务器架构**: 自动扩容
- **模块化设计**: 功能独立，易于维护
- **API优先**: 便于后续移动端开发

---

## ⚠️ 重要提醒

### Vercel免费版限制
- 确保在免费额度内开发MVP
- 监控使用量，及时优化
- 准备升级计划

### 开发建议
- 优先实现核心功能
- 保持代码简洁和可读性
- 定期提交代码，利用自动部署
- 收集用户反馈，快速迭代

记住：**MVP的目标是验证产品市场匹配度，功能完整比功能完美更重要！**