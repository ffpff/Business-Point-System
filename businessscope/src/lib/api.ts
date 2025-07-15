import type { FilterState } from '@/types'
import type { Prisma } from '@prisma/client'

// API响应基础类型
interface BaseApiResponse<T = unknown> {
  success: boolean
  error?: string
  details?: unknown
  data?: T
}

// 分页元数据类型
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// 带分页的API响应类型
interface PaginatedApiResponse<T> extends BaseApiResponse<T> {
  meta: PaginationMeta
}

// 机会列表响应类型
type OpportunityWithAnalysis = Prisma.RawContentGetPayload<{
  include: { analysis: true }
}>

interface OpportunitiesData {
  opportunities: OpportunityWithAnalysis[]
  total: number
}

// 机会详情响应类型
interface OpportunityDetailResponse extends BaseApiResponse {
  opportunity: OpportunityWithAnalysis & { isBookmarked?: boolean }
}

// 搜索建议响应类型
interface SearchSuggestionsResponse extends BaseApiResponse {
  suggestions: string[]
}

// 搜索历史响应类型
interface SearchHistoryItem {
  id: string
  query: string
  searchedAt: string
  resultCount: number
}

interface SearchHistoryResponse extends BaseApiResponse {
  history: SearchHistoryItem[]
}

// 用户统计响应类型
interface UserStatsResponse extends BaseApiResponse {
  stats: {
    totalViews: number
    totalBookmarks: number
    averageScore: number
    activeDays: number
    favoriteTopics: string[]
    platformDistribution: Record<string, number>
  }
}

// 用户活动响应类型
interface UserActivity {
  id: string
  action: string
  contentId?: string
  createdAt: string
  metadata?: Record<string, unknown>
}

interface UserActivitiesResponse extends BaseApiResponse {
  activities: UserActivity[]
}

// 用户使用图表响应类型
interface UsageChartData {
  daily: { date: string; count: number }[]
  weekly: { week: string; count: number }[]
  platforms: { platform: string; count: number; percentage: number }[]
}

interface UsageChartResponse extends BaseApiResponse {
  data: UsageChartData
}

// 收藏响应类型
interface BookmarksResponse extends BaseApiResponse {
  bookmarks: (OpportunityWithAnalysis & { bookmarkedAt: string; notes?: string })[]
}

// 查询参数类型
interface OpportunitiesQueryParams extends Partial<FilterState> {
  page?: number
  limit?: number
}

interface SearchQueryParams extends OpportunitiesQueryParams {
  q: string
  searchType?: 'all' | 'title' | 'content' | 'author' | 'tags'
  sortBy?: 'relevance' | 'date' | 'score' | 'popularity'
}

// API错误类
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API客户端类
class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  // 基础请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const finalOptions = { ...defaultOptions, ...options }

    try {
      const response = await fetch(url, finalOptions)
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetails: unknown = undefined

        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
          if (errorData.details) {
            errorDetails = errorData.details
          }
        } catch {
          // 忽略JSON解析错误，使用默认错误消息
        }

        throw new ApiError(errorMessage, response.status, errorDetails)
      }

      const data = await response.json()
      
      // 检查业务逻辑错误
      if ('success' in data && !data.success) {
        throw new ApiError(
          data.error || '请求失败',
          response.status,
          data.details
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // 网络错误或其他错误
      if (error instanceof Error) {
        throw new ApiError(
          `网络请求失败: ${error.message}`,
          0
        )
      }

      throw new ApiError('未知错误', 0)
    }
  }

  // GET请求
  private async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let url = endpoint
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            searchParams.set(key, value.join(','))
          } else {
            searchParams.set(key, String(value))
          }
        }
      })
      
      const paramString = searchParams.toString()
      if (paramString) {
        url += `?${paramString}`
      }
    }

    return this.request<T>(url, { method: 'GET' })
  }

  // POST请求
  private async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT请求
  private async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE请求
  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // === 商业机会相关API ===

  /**
   * 获取机会列表（支持筛选和分页）
   */
  async getOpportunities(params: OpportunitiesQueryParams = {}): Promise<PaginatedApiResponse<OpportunitiesData>> {
    // 处理筛选参数格式
    const queryParams: Record<string, unknown> = {
      page: params.page || 1,
      limit: params.limit || 20,
    }

    // 平台筛选
    if (params.platform && params.platform.length > 0) {
      queryParams.platforms = params.platform.join(',')
    }

    // 时间范围筛选
    if (params.dateRange) {
      queryParams.dateRange = `${params.dateRange.start.toISOString()},${params.dateRange.end.toISOString()}`
    }

    // 评分筛选
    if (params.minScore !== undefined) queryParams.minScore = params.minScore
    if (params.maxScore !== undefined) queryParams.maxScore = params.maxScore

    // 评级筛选
    if (params.finalRate && params.finalRate.length > 0) {
      queryParams.finalRates = params.finalRate.join(',')
    }

    // 情感标签筛选
    if (params.sentimentLabel && params.sentimentLabel.length > 0) {
      queryParams.sentimentLabels = params.sentimentLabel.join(',')
    }

    // 关键词搜索
    if (params.searchQuery) queryParams.searchQuery = params.searchQuery

    // 标签筛选
    if (params.tags && params.tags.length > 0) {
      queryParams.tags = params.tags.join(',')
    }

    // 是否有分析
    if (params.hasAnalysis !== undefined) {
      queryParams.hasAnalysis = params.hasAnalysis.toString()
    }

    return this.get<PaginatedApiResponse<OpportunitiesData>>('/api/opportunities', queryParams)
  }

  /**
   * 获取单个机会详情
   */
  async getOpportunity(id: string): Promise<OpportunityDetailResponse> {
    return this.get<OpportunityDetailResponse>(`/api/opportunities/${id}`)
  }

  /**
   * 收藏/取消收藏机会
   */
  async toggleBookmark(id: string, action: 'bookmark' | 'unbookmark', notes?: string): Promise<BaseApiResponse> {
    return this.put<BaseApiResponse>(`/api/opportunities/${id}`, {
      action,
      notes
    })
  }

  /**
   * 获取趋势分析数据
   */
  async getTrendingData(params: { dateRange?: string; platform?: string } = {}): Promise<BaseApiResponse> {
    return this.get<BaseApiResponse>('/api/opportunities/trending', params)
  }

  // === 搜索相关API ===

  /**
   * 高级搜索机会
   */
  async searchOpportunities(params: SearchQueryParams): Promise<PaginatedApiResponse<OpportunitiesData>> {
    const queryParams: Record<string, unknown> = {
      q: params.q,
      page: params.page || 1,
      limit: params.limit || 20,
      searchType: params.searchType || 'all',
      sortBy: params.sortBy || 'relevance',
    }

    // 复用机会列表的筛选参数处理逻辑
    if (params.platform && params.platform.length > 0) {
      queryParams.platforms = params.platform.join(',')
    }

    if (params.dateRange) {
      queryParams.dateRange = `${params.dateRange.start.toISOString()},${params.dateRange.end.toISOString()}`
    }

    if (params.minScore !== undefined) queryParams.minScore = params.minScore
    if (params.maxScore !== undefined) queryParams.maxScore = params.maxScore

    if (params.finalRate && params.finalRate.length > 0) {
      queryParams.finalRates = params.finalRate.join(',')
    }

    if (params.sentimentLabel && params.sentimentLabel.length > 0) {
      queryParams.sentimentLabels = params.sentimentLabel.join(',')
    }

    if (params.tags && params.tags.length > 0) {
      queryParams.tags = params.tags.join(',')
    }

    if (params.hasAnalysis !== undefined) {
      queryParams.hasAnalysis = params.hasAnalysis.toString()
    }

    return this.get<PaginatedApiResponse<OpportunitiesData>>('/api/search', queryParams)
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestionsResponse> {
    return this.get<SearchSuggestionsResponse>('/api/search/suggestions', { q: query })
  }

  /**
   * 获取搜索历史
   */
  async getSearchHistory(): Promise<SearchHistoryResponse> {
    return this.get<SearchHistoryResponse>('/api/search/history')
  }

  /**
   * 清除搜索历史
   */
  async clearSearchHistory(): Promise<BaseApiResponse> {
    return this.delete<BaseApiResponse>('/api/search/history')
  }

  // === 用户相关API ===

  /**
   * 获取用户统计数据
   */
  async getUserStats(): Promise<UserStatsResponse> {
    return this.get<UserStatsResponse>('/api/user/stats')
  }

  /**
   * 获取用户活动记录
   */
  async getUserActivities(params: { page?: number; limit?: number } = {}): Promise<UserActivitiesResponse> {
    return this.get<UserActivitiesResponse>('/api/user/activities', params)
  }

  /**
   * 获取用户使用图表数据
   */
  async getUserUsageChart(params: { timeRange?: string } = {}): Promise<UsageChartResponse> {
    return this.get<UsageChartResponse>('/api/user/usage-chart', params)
  }

  /**
   * 获取用户收藏列表
   */
  async getUserBookmarks(params: { page?: number; limit?: number } = {}): Promise<BookmarksResponse> {
    return this.get<BookmarksResponse>('/api/user/bookmarks', params)
  }

  /**
   * 删除收藏
   */
  async removeBookmark(id: string): Promise<BaseApiResponse> {
    return this.delete<BaseApiResponse>(`/api/user/bookmarks/${id}`)
  }

  /**
   * 获取用户个人资料
   */
  async getUserProfile(): Promise<BaseApiResponse> {
    return this.get<BaseApiResponse>('/api/user/profile')
  }

  /**
   * 更新用户个人资料
   */
  async updateUserProfile(data: {
    name?: string
    email?: string
    preferences?: Record<string, unknown>
  }): Promise<BaseApiResponse> {
    return this.put<BaseApiResponse>('/api/user/profile', data)
  }
}

// 创建默认的API客户端实例
export const api = new ApiClient()

// 导出类型和错误类
export type {
  BaseApiResponse,
  PaginatedApiResponse,
  OpportunityWithAnalysis,
  OpportunityDetailResponse,
  SearchSuggestionsResponse,
  SearchHistoryResponse,
  UserStatsResponse,
  UserActivitiesResponse,
  UsageChartResponse,
  BookmarksResponse,
  OpportunitiesQueryParams,
  SearchQueryParams,
  UserActivity,
  SearchHistoryItem,
  UsageChartData
}

export { ApiError, ApiClient }