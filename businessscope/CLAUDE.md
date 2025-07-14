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
npm run db:push               # Push schema changes to database
npm run db:studio             # Open Prisma Studio

# Testing Database Connections
npm run test:db               # Test PostgreSQL connection (Node.js)
npm run test:redis            # Test Redis connection (Node.js)  
npm run test:connections      # Test all connections (TypeScript)
npm run test:prisma          # Test Prisma operations (TypeScript)
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