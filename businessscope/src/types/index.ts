// 原始内容数据结构
export interface RawContent {
  id: string
  platform: 'twitter' | 'reddit' | 'hackernews' | 'producthunt'
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
  status: string
}

// AI分析结果数据结构
export interface AIAnalysis {
  id: string
  contentId: string
  sentimentLabel?: string
  sentimentScore?: number
  mainTopic?: string
  keywords?: string
  businessRate?: number
  contentRate?: number
  finalRate?: 'A' | 'B' | 'C' | 'D'
  reason?: string
  analyzedAt: Date
}

// 用户数据结构
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  subscriptionType: 'free' | 'professional' | 'enterprise'
  dailyUsageCount: number
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

// 筛选状态接口
export interface FilterState {
  platform?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  minScore?: number
  finalRate?: ('A' | 'B' | 'C' | 'D')[]
  searchQuery?: string
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