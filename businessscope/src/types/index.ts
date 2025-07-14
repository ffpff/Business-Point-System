// 平台类型枚举
export type Platform = 'twitter' | 'reddit' | 'hackernews' | 'producthunt'

// 内容状态枚举
export type ContentStatus = '待处理' | '已分析' | '已忽略' | '已删除'

// 评分等级枚举
export type FinalRate = 'A' | 'B' | 'C' | 'D'

// 订阅类型枚举
export type SubscriptionType = 'free' | 'professional' | 'enterprise'

// 原始内容数据结构
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

// 情感分析标签
export type SentimentLabel = 'positive' | 'negative' | 'neutral'

// AI分析结果数据结构
export interface AIAnalysis {
  id: string
  contentId: string
  sentimentLabel?: SentimentLabel
  sentimentScore?: number // 0-1 区间
  mainTopic?: string
  keywords?: string[] // 改为数组
  businessRate?: number // 0-100 商业价值评分
  contentRate?: number // 0-100 内容质量评分
  finalRate?: FinalRate
  reason?: string
  confidence?: number // 0-1 AI分析置信度
  analyzedAt: Date
  createdAt: Date
  updatedAt: Date
}

// 用户数据结构
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  subscriptionType: SubscriptionType
  dailyUsageCount: number
  monthlyUsageCount: number
  usageLimit: number // 基于订阅类型的使用限制
  lastActiveAt?: Date
  createdAt: Date
  updatedAt: Date
}

// 用户收藏数据结构
export interface Bookmark {
  id: string
  userId: string
  contentId: string
  createdAt: Date
  notes?: string
}

// 日期范围类型
export interface DateRange {
  start: Date
  end: Date
}

// 筛选状态接口
export interface FilterState {
  platform?: Platform[]
  dateRange?: DateRange
  minScore?: number
  maxScore?: number
  finalRate?: FinalRate[]
  sentimentLabel?: SentimentLabel[]
  searchQuery?: string
  tags?: string[]
  hasAnalysis?: boolean
}

// API响应通用结构
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页查询参数
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

// 查询参数接口
export interface QueryParams extends PaginationParams {
  platform?: string
  dateRange?: string
  minScore?: number
  searchQuery?: string
  finalRate?: string
}

// 完整的机会数据（包含分析结果）
export interface OpportunityWithAnalysis extends RawContent {
  analysis?: AIAnalysis
  isBookmarked?: boolean
}

// 统计数据类型
export interface DashboardStats {
  totalOpportunities: number
  analyzedOpportunities: number
  bookmarkedOpportunities: number
  todayOpportunities: number
  averageScore: number
  platformDistribution: Record<Platform, number>
  rateDistribution: Record<FinalRate, number>
}

// 趋势数据
export interface TrendData {
  date: string
  count: number
  score: number
}

// 搜索结果类型
export interface SearchResult {
  opportunities: OpportunityWithAnalysis[]
  total: number
  facets: {
    platforms: Record<Platform, number>
    rates: Record<FinalRate, number>
    sentiments: Record<SentimentLabel, number>
  }
}

// 用户活动日志
export interface UserActivity {
  id: string
  userId: string
  action: 'view' | 'bookmark' | 'search' | 'filter' | 'export'
  contentId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// 系统配置
export interface SystemConfig {
  maxDailyUsage: Record<SubscriptionType, number>
  enabledPlatforms: Platform[]
  aiAnalysisEnabled: boolean
  maintenanceMode: boolean
}

// NextAuth用户会话扩展
export interface SessionUser extends User {
  accessToken?: string
  refreshToken?: string
}

// NextAuth类型扩展
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      subscriptionType?: string
      usageLimit?: number
      dailyUsageCount?: number
      monthlyUsageCount?: number
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    image?: string
    subscriptionType?: string
    usageLimit?: number
    dailyUsageCount?: number
    monthlyUsageCount?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    subscriptionType?: string
    usageLimit?: number
    dailyUsageCount?: number
    monthlyUsageCount?: number
  }
}