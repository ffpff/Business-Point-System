# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BusinessScope is a Next.js 15 application that aggregates and analyzes business opportunities from social platforms (Twitter, Reddit, HackerNews, ProductHunt). It uses AI analysis to rate content and helps users discover valuable business insights. The app is designed for deployment on Vercel with PostgreSQL and Redis.

## Development Commands

```bash
# Development
npm run dev                    # Start dev server with Turbopack
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database Operations
npm run db:generate            # Generate Prisma client
npm run db:push               # Push schema changes to database (新版本，解决环境变量问题)
npm run db:verify             # 验证数据库schema状态
npm run db:sync               # 手动同步schema（fallback方案）
npm run db:deploy             # 完整数据库部署流程
npm run db:studio             # Open Prisma Studio

# Testing Database Connections
npm run test:db               # Test PostgreSQL connection (Node.js)
npm run test:redis            # Test Redis connection (Node.js)  
npm run test:connections      # Test all connections (TypeScript)
npm run test:prisma          # Test Prisma operations (TypeScript)

# Advanced Schema Management
node scripts/schema-manager.js snapshot  # 生成schema快照
node scripts/schema-manager.js compare   # 比较schema差异  
node scripts/schema-manager.js fix       # 自动修复schema
node scripts/schema-manager.js health    # 数据库健康检查
```

## Architecture Overview

### Data Flow Architecture
The application follows a content aggregation → AI analysis → user consumption pattern:

1. **Data Collection**: External systems (n8n workflows) push content via webhook APIs
2. **AI Analysis**: Content gets analyzed for business value, sentiment, and categorization
3. **User Interaction**: Users browse, filter, bookmark, and get insights from processed content

### Database Schema (PostgreSQL + Prisma)
- **RawContent**: Core content from platforms with metadata and engagement metrics
- **AIAnalysis**: AI-generated insights linked to content (sentiment, business rating, topics)
- **User Management**: NextAuth integration with custom user profiles and subscription tracking
- **User Activities**: Comprehensive activity logging (bookmarks, views, searches)

### Authentication & Authorization
- NextAuth.js with dual provider support (Credentials + Google OAuth)
- Middleware-protected routes for `/dashboard/*` and `/api/user/*`, `/api/opportunities/*`
- Password hashing with bcryptjs, JWT session strategy
- Custom session extension with subscription and usage tracking

### API Architecture (App Router)
**Opportunities APIs**: 
- `/api/opportunities` - Paginated content with advanced filtering (platform, date, rating, keywords)
- `/api/opportunities/[id]` - Content details with AI analysis and bookmark status
- `/api/opportunities/trending` - Analytics endpoints for trending topics and platform stats

**User Management APIs**:
- `/api/user/profile` - Profile CRUD operations
- `/api/user/bookmarks` - Bookmark management with batch operations
- `/api/user/usage` - Usage analytics and subscription limits

**Authentication APIs**:
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/auth/register` - Custom user registration with validation

### State Management & Data Layer
- **DatabaseService Class**: Centralized data operations with 20+ methods for complex queries
- **Zustand**: Client-side state management (store setup at `src/store/`)
- **Zod Validation**: Comprehensive schemas for all API inputs (`src/lib/validations.ts`)
- **Type Safety**: Full TypeScript coverage with custom types in `src/types/`

### UI Components (shadcn/ui + Tailwind)
- **Component Architecture**: `src/components/ui/` (16 base components), `src/components/features/` (business logic), `src/components/layout/` (shell components)
- **Styling**: Tailwind CSS 4 with custom configuration and new-york theme
- **Form Handling**: React Hook Form + Zod resolvers for type-safe forms

## Key Implementation Patterns

### Database Operations
The `DatabaseService` class in `src/lib/db.ts` provides statically-typed database operations. Always use this instead of direct Prisma calls for consistency:

```typescript
// Good
const opportunities = await DatabaseService.getOpportunities({ page: 1, limit: 20, filters })

// Avoid
const opportunities = await prisma.rawContent.findMany(...)
```

### API Response Format
All APIs follow a consistent response structure:
```typescript
// Success
{ success: true, data: T, meta?: PaginationMeta }

// Error  
{ success: false, error: string, details?: ValidationError[] }
```

### Authentication in API Routes
All protected APIs follow this pattern:
```typescript
const session = await getServerSession(authOptions)
if (!session?.user?.id) {
  return NextResponse.json({ success: false, error: '未认证，请先登录' }, { status: 401 })
}
```

### Activity Logging
User activities are automatically tracked via `DatabaseService.logUserActivity()`. This is used for analytics and user behavior insights.

## Environment Variables

Required for development:
```
POSTGRES_PRISMA_URL=          # Prisma connection URL  
POSTGRES_URL_NON_POOLING=     # Direct database connection
KV_REST_API_URL=              # Redis/Upstash URL
KV_REST_API_TOKEN=            # Redis auth token
NEXTAUTH_SECRET=              # Auth signing secret
NEXTAUTH_URL=                 # App base URL
GOOGLE_CLIENT_ID=             # OAuth (optional)
GOOGLE_CLIENT_SECRET=         # OAuth (optional)
GEMINI_API_KEY=              # AI analysis (future use)
```

## Important Development Notes

### Database Schema Changes
When modifying Prisma schema:
1. Update `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update client
4. Update corresponding TypeScript types in `src/types/`

### API Route Patterns
- Use Next.js 15 App Router conventions
- All route handlers are async and handle params as `Promise<{ params }>`
- Implement proper error boundaries and Zod validation
- Follow RESTful patterns (GET for read, POST for create, PUT for update, DELETE for remove)

### Testing Database Operations
Use the provided test scripts to verify database connectivity and operations:
- Individual connection tests: `npm run test:db`, `npm run test:redis`
- Full operation tests: `npm run test:prisma`, `npm run test:connections`

### Code Quality
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Zod for runtime validation at API boundaries
- Consistent error handling patterns across all API routes

## TypeScript 最佳实践与常见问题

### Prisma 类型使用规范

**问题：** 使用自定义接口类型与 Prisma 生成类型不匹配导致的类型错误

**错误示例：**
```typescript
// ❌ 错误：自定义类型与Prisma类型不匹配
import { OpportunityWithAnalysis } from '../src/types'
result.opportunities.forEach((item: OpportunityWithAnalysis) => {
  // TypeError: 类型不兼容
})
```

**正确做法：**
```typescript
// ✅ 正确：使用Prisma生成的准确类型
import { Prisma } from '@prisma/client'

type OpportunityWithAnalysis = Prisma.RawContentGetPayload<{
  include: { analysis: true }
}>

result.opportunities.forEach((item: OpportunityWithAnalysis) => {
  // 类型匹配，编译通过
})
```

**核心原则：**
1. **优先使用 Prisma 生成的类型：** 使用 `Prisma.ModelNameGetPayload<>` 而非自定义接口
2. **包含关系类型定义：** 准确反映 `include` 和 `select` 的查询结构
3. **null vs undefined 区别：** Prisma 使用 `null`，自定义接口通常使用 `undefined`
4. **类型推断辅助：** 复杂查询时明确声明类型，避免隐式 `any`

### 常见类型错误排查

**错误信息：** `Parameter 'item' implicitly has an 'any' type`
- **原因：** TypeScript 无法推断回调函数参数类型
- **解决：** 明确声明参数类型或使用正确的 Prisma 类型

**错误信息：** `Type 'null' is not assignable to type 'T | undefined'`
- **原因：** Prisma 字段可能为 `null`，但类型期望 `undefined`
- **解决：** 使用 Prisma 生成的准确类型定义

### 脚本文件类型安全

对于 `scripts/` 目录下的工具脚本：
1. 必须导入正确的 Prisma 类型
2. 避免使用宽泛的 `any` 类型
3. 利用 TypeScript 严格模式捕获类型错误
4. 构建时会进行类型检查，确保生产环境类型安全

## 数据库管理最佳实践

### 数据库推送问题解决方案

**问题背景**: 原生 `prisma db push` 在此项目中经常遇到环境变量加载和连接超时问题。

**解决方案**: 实施了分层的数据库管理工具链:

1. **基础工具** (`scripts/db-manager.js`)
   - 统一环境变量加载 (使用 dotenv-cli)
   - 智能fallback机制 (推送失败时自动执行手动同步)
   - 完整的部署流程验证

2. **高级工具** (`scripts/schema-manager.js`)
   - Schema快照和版本管理
   - 自动差异检测和修复
   - 数据库健康检查

### 推荐工作流程

**开发环境Schema变更:**
```bash
# 1. 修改 prisma/schema.prisma
# 2. 执行部署流程
npm run db:deploy

# 3. 如果推送失败，使用手动同步
npm run db:sync

# 4. 验证结果
npm run db:verify
```

**生产环境部署:**
```bash
# 1. 生成schema快照 (用于回滚)
node scripts/schema-manager.js snapshot

# 2. 健康检查
node scripts/schema-manager.js health

# 3. 执行部署
npm run db:deploy
```

### 常见问题处理

1. **环境变量加载失败**: 所有数据库脚本已配置自动加载 `.env.local`
2. **连接超时**: 实施了自动fallback到手动SQL执行
3. **Schema不同步**: 使用 `schema-manager.js` 进行自动检测和修复

### 新增安全字段

项目已完成账户锁定机制的schema变更:
- `login_failed_count`: 登录失败计数
- `locked_at`: 锁定时间戳  
- `lock_until`: 锁定过期时间

这些字段已通过手动SQL方式添加，确保了向后兼容性。