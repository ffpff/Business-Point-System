import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 原有的pg连接测试函数保留
import { Client } from 'pg';

export async function testConnection() {
  try {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });

    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return { success: true, message: '数据库连接成功' };
  } catch (error) {
    return { 
      success: false, 
      message: `数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}

// Prisma连接测试函数
export async function testPrismaConnection() {
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    await prisma.$disconnect()
    return { 
      success: true, 
      message: 'Prisma数据库连接成功',
      result 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Prisma连接失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}

// 导入类型定义
import type { 
  RawContent, 
  AIAnalysis, 
  User, 
  FilterState,
  PaginationParams,
  ContentStatus
} from '@/types'

/**
 * 数据库操作类 - 封装常用查询方法
 */
export class DatabaseService {
  
  // ==================== RawContent 相关操作 ====================
  
  /**
   * 获取分页的机会列表
   */
  static async getOpportunities(params: {
    page: number
    limit: number
    filters?: FilterState
  }) {
    const { page, limit, filters = {} } = params
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // 应用筛选条件
    if (filters.platform?.length) {
      where.platform = { in: filters.platform }
    }
    
    if (filters.dateRange) {
      where.collectedAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      }
    }

    if (filters.searchQuery) {
      where.OR = [
        { title: { contains: filters.searchQuery, mode: 'insensitive' } },
        { content: { contains: filters.searchQuery, mode: 'insensitive' } },
        { author: { contains: filters.searchQuery, mode: 'insensitive' } }
      ]
    }

    if (filters.finalRate?.length) {
      where.analysis = {
        finalRate: { in: filters.finalRate }
      }
    }

    if (filters.hasAnalysis !== undefined) {
      if (filters.hasAnalysis) {
        where.analysis = { isNot: null }
      } else {
        where.analysis = null
      }
    }

    const [opportunities, total] = await Promise.all([
      prisma.rawContent.findMany({
        where,
        include: {
          analysis: true
        },
        orderBy: { collectedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.rawContent.count({ where })
    ])

    return {
      opportunities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * 根据ID获取单个机会详情
   */
  static async getOpportunityById(id: string) {
    return await prisma.rawContent.findUnique({
      where: { id },
      include: {
        analysis: true,
        bookmarks: true
      }
    })
  }

  /**
   * 创建新的原始内容
   */
  static async createRawContent(data: Omit<RawContent, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.rawContent.create({
      data: {
        ...data,
        tags: data.tags || null,
        publishedAt: data.publishedAt || null,
        originalUrl: data.originalUrl || null,
        title: data.title || null,
        content: data.content || null,
        author: data.author || null
      }
    })
  }

  /**
   * 批量创建原始内容
   */
  static async createManyRawContent(data: Omit<RawContent, 'id' | 'createdAt' | 'updatedAt'>[]) {
    return await prisma.rawContent.createMany({
      data: data.map(item => ({
        ...item,
        tags: item.tags || null,
        publishedAt: item.publishedAt || null,
        originalUrl: item.originalUrl || null,
        title: item.title || null,
        content: item.content || null,
        author: item.author || null
      })),
      skipDuplicates: true
    })
  }

  /**
   * 更新内容状态
   */
  static async updateContentStatus(id: string, status: ContentStatus) {
    return await prisma.rawContent.update({
      where: { id },
      data: { status }
    })
  }

  // ==================== AI分析 相关操作 ====================

  /**
   * 创建AI分析结果
   */
  static async createAIAnalysis(data: Omit<AIAnalysis, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.aIAnalysis.create({
      data: {
        ...data,
        sentimentLabel: data.sentimentLabel || null,
        sentimentScore: data.sentimentScore || null,
        mainTopic: data.mainTopic || null,
        keywords: data.keywords || undefined,
        businessRate: data.businessRate || null,
        contentRate: data.contentRate || null,
        finalRate: data.finalRate || null,
        reason: data.reason || null,
        confidence: data.confidence || null
      }
    })
  }

  /**
   * 获取待分析的内容
   */
  static async getPendingContent(limit = 10) {
    return await prisma.rawContent.findMany({
      where: {
        status: '待处理',
        analysis: null
      },
      take: limit,
      orderBy: { collectedAt: 'asc' }
    })
  }

  // ==================== 用户 相关操作 ====================

  /**
   * 根据邮箱获取用户
   */
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  /**
   * 创建新用户
   */
  static async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.user.create({
      data: {
        ...data,
        name: data.name || null,
        image: data.image || null,
        lastActiveAt: data.lastActiveAt || null
      }
    })
  }

  /**
   * 更新用户使用量
   */
  static async updateUserUsage(userId: string, type: 'daily' | 'monthly') {
    const field = type === 'daily' ? 'dailyUsageCount' : 'monthlyUsageCount'
    
    return await prisma.user.update({
      where: { id: userId },
      data: {
        [field]: { increment: 1 },
        lastActiveAt: new Date()
      }
    })
  }

  /**
   * 更新用户资料
   */
  static async updateUserProfile(userId: string, data: { name?: string; email?: string }) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        name: data.name || null,
        lastActiveAt: new Date()
      }
    })
  }

  // ==================== 收藏 相关操作 ====================

  /**
   * 添加收藏
   */
  static async addBookmark(userId: string, contentId: string, notes?: string) {
    return await prisma.bookmark.create({
      data: {
        userId,
        contentId,
        notes: notes || null
      }
    })
  }

  /**
   * 移除收藏
   */
  static async removeBookmark(userId: string, contentId: string) {
    return await prisma.bookmark.deleteMany({
      where: {
        userId,
        contentId
      }
    })
  }

  /**
   * 获取用户收藏列表
   */
  static async getUserBookmarks(userId: string, pagination: PaginationParams) {
    const { page, limit } = pagination
    const skip = (page - 1) * limit

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          content: {
            include: {
              analysis: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.bookmark.count({ where: { userId } })
    ])

    return {
      bookmarks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // ==================== 统计 相关操作 ====================



  /**
   * 获取用户仪表板统计数据
   */
  static async getDashboardStats(userId?: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalOpportunities,
      analyzedOpportunities,
      todayOpportunities,
      avgScoreResult,
      bookmarkedCount
    ] = await Promise.all([
      prisma.rawContent.count(),
      prisma.rawContent.count({
        where: { analysis: { isNot: null } }
      }),
      prisma.rawContent.count({
        where: { collectedAt: { gte: today } }
      }),
      prisma.aIAnalysis.aggregate({
        _avg: { businessRate: true },
        where: { businessRate: { not: null } }
      }),
      userId ? prisma.bookmark.count({ where: { userId } }) : 0
    ])

    return {
      totalOpportunities,
      analyzedOpportunities,
      bookmarkedOpportunities: bookmarkedCount,
      todayOpportunities,
      averageScore: avgScoreResult._avg.businessRate || 0
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 健康检查 - 验证数据库连接
   */
  static async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { healthy: true, message: '数据库连接正常' }
    } catch (error) {
      return { 
        healthy: false, 
        message: `数据库连接异常: ${error instanceof Error ? error.message : '未知错误'}` 
      }
    }
  }

  /**
   * 清理过期数据
   */
  static async cleanupOldData(daysToKeep = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const deletedCount = await prisma.rawContent.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: '已删除'
      }
    })

    return deletedCount
  }

  /**
   * 检查用户是否收藏了某个内容
   */
  static async isBookmarked(userId: string, contentId: string): Promise<boolean> {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId
        }
      }
    })
    return !!bookmark
  }

  /**
   * 记录用户活动
   */
  static async logUserActivity(data: {
    userId: string
    action: string
    contentId?: string
    metadata?: Record<string, unknown>
  }) {
    return await prisma.userActivity.create({
      data: {
        userId: data.userId,
        action: data.action,
        contentId: data.contentId,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : {}
      }
    })
  }

  /**
   * 获取用户指定时间范围内的活动记录
   */
  static async getUserActivitiesInRange(userId: string, startDate: Date, endDate: Date) {
    return await prisma.userActivity.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1000 // 限制返回数量，避免数据过大
    })
  }

  /**
   * 获取用户收藏统计
   */
  static async getUserBookmarkStats(userId: string) {
    const [totalBookmarks, recentBookmarks, topPlatforms] = await Promise.all([
      // 总收藏数
      prisma.bookmark.count({ where: { userId } }),
      
      // 最近7天收藏数
      prisma.bookmark.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 收藏内容的平台分布
      prisma.bookmark.groupBy({
        by: ['contentId'],
        where: { userId },
        _count: { id: true }
      }).then(async (bookmarks) => {
        // 获取内容的平台信息
        const contentIds = bookmarks.map(b => b.contentId)
        const contents = await prisma.rawContent.findMany({
          where: { id: { in: contentIds } },
          select: { id: true, platform: true }
        })
        
        const platformCounts: Record<string, number> = {}
        contents.forEach(content => {
          const bookmark = bookmarks.find(b => b.contentId === content.id)
          if (bookmark) {
            platformCounts[content.platform] = (platformCounts[content.platform] || 0) + bookmark._count.id
          }
        })
        
        return Object.entries(platformCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([platform, count]) => ({ platform, count }))
      })
    ])

    return {
      totalBookmarks,
      recentBookmarks,
      topPlatforms
    }
  }

  // ==================== 趋势分析相关方法 ====================

  /**
   * 获取热门话题/关键词
   */
  static async getHotTopics(params: {
    startDate: Date
    endDate: Date
    platform?: string
    limit: number
  }) {
    const { startDate, endDate, platform, limit } = params

    const where: Record<string, unknown> = {
      collectedAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (platform) {
      where.platform = platform
    }

    // 获取关键词统计
    const keywordsData = await prisma.aIAnalysis.findMany({
      where: {
        content: where
      },
      select: {
        keywords: true,
        mainTopic: true,
        content: {
          select: {
            likesCount: true,
            sharesCount: true,
            commentsCount: true
          }
        }
      }
    })

    // 统计关键词频率
    const keywordCount: Record<string, { count: number; engagement: number }> = {}
    
    keywordsData.forEach(analysis => {
      const engagement = (analysis.content?.likesCount || 0) + 
                       (analysis.content?.sharesCount || 0) + 
                       (analysis.content?.commentsCount || 0)
      
      analysis.keywords?.forEach(keyword => {
        if (!keywordCount[keyword]) {
          keywordCount[keyword] = { count: 0, engagement: 0 }
        }
        keywordCount[keyword].count++
        keywordCount[keyword].engagement += engagement
      })

      if (analysis.mainTopic) {
        if (!keywordCount[analysis.mainTopic]) {
          keywordCount[analysis.mainTopic] = { count: 0, engagement: 0 }
        }
        keywordCount[analysis.mainTopic].count++
        keywordCount[analysis.mainTopic].engagement += engagement
      }
    })

    // 排序并返回热门话题
    return Object.entries(keywordCount)
      .sort((a, b) => (b[1].count * 0.7 + b[1].engagement * 0.3) - (a[1].count * 0.7 + a[1].engagement * 0.3))
      .slice(0, limit)
      .map(([topic, stats]) => ({
        topic,
        count: stats.count,
        engagement: stats.engagement,
        score: stats.count * 0.7 + stats.engagement * 0.3
      }))
  }

  /**
   * 获取平台统计数据
   */
  static async getPlatformStats(params: {
    startDate: Date
    endDate: Date
    platform?: string
  }) {
    const { startDate, endDate, platform } = params

    const where: Record<string, unknown> = {
      collectedAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (platform) {
      where.platform = platform
    }

    const stats = await prisma.rawContent.groupBy({
      by: ['platform'],
      where,
      _count: {
        id: true
      },
      _avg: {
        likesCount: true,
        sharesCount: true,
        commentsCount: true
      },
      _sum: {
        likesCount: true,
        sharesCount: true,
        commentsCount: true
      }
    })

    return stats.map(stat => ({
      platform: stat.platform,
      contentCount: stat._count.id,
      avgLikes: Math.round(stat._avg.likesCount || 0),
      avgShares: Math.round(stat._avg.sharesCount || 0),
      avgComments: Math.round(stat._avg.commentsCount || 0),
      totalEngagement: (stat._sum.likesCount || 0) + 
                      (stat._sum.sharesCount || 0) + 
                      (stat._sum.commentsCount || 0)
    }))
  }

  /**
   * 获取评分分布
   */
  static async getRateDistribution(params: {
    startDate: Date
    endDate: Date
    platform?: string
  }) {
    const { startDate, endDate, platform } = params

    const where: Record<string, unknown> = {
      content: {
        collectedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }

    if (platform) {
      where.content = {
        ...(where.content as Record<string, unknown>),
        platform
      }
    }

    const distribution = await prisma.aIAnalysis.groupBy({
      by: ['finalRate'],
      where,
      _count: {
        id: true
      },
      _avg: {
        businessRate: true,
        contentRate: true,
        confidence: true
      }
    })

    return distribution
      .filter(item => item.finalRate)
      .map(item => ({
        rate: item.finalRate,
        count: item._count.id,
        avgBusinessRate: Math.round(item._avg.businessRate || 0),
        avgContentRate: Math.round(item._avg.contentRate || 0),
        avgConfidence: Math.round((item._avg.confidence || 0) * 100) / 100
      }))
  }

  /**
   * 获取时间序列数据
   */
  static async getTimeSeriesData(params: {
    startDate: Date
    endDate: Date
    platform?: string
    interval: 'day' | 'week'
  }) {
    const { startDate, endDate, platform, interval } = params

    const where: Record<string, unknown> = {
      collectedAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (platform) {
      where.platform = platform
    }

    // 使用原生SQL查询进行时间分组
    
    const rawResults = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${interval}, "collected_at") as period,
        COUNT(*) as count,
        AVG(COALESCE(ai."business_rate", 0)) as avg_score,
        SUM("likes_count" + "shares_count" + "comments_count") as total_engagement
      FROM "raw_content" rc
      LEFT JOIN "ai_analysis" ai ON rc.id = ai.content_id
      WHERE rc."collected_at" >= ${startDate}
        AND rc."collected_at" <= ${endDate}
        ${platform ? Prisma.sql`AND rc.platform = ${platform}` : Prisma.empty}
      GROUP BY DATE_TRUNC(${interval}, "collected_at")
      ORDER BY period ASC
    ` as Array<{
      period: Date
      count: bigint
      avg_score: number | null
      total_engagement: bigint | null
    }>

    return rawResults.map(result => ({
      date: result.period.toISOString().split('T')[0],
      count: Number(result.count),
      avgScore: Math.round(result.avg_score || 0),
      totalEngagement: Number(result.total_engagement || 0)
    }))
  }

  // ==================== 用户活动 相关操作 ====================

  /**
   * 获取用户活动记录
   */
  static async getUserActivities(userId: string, params: {
    page: number
    limit: number
    activityType?: string
  }) {
    const { page, limit, activityType } = params
    const skip = (page - 1) * limit
    
    const where: Record<string, unknown> = { userId }
    if (activityType) {
      where.action = activityType
    }

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          content: {
            select: {
              id: true,
              title: true,
              platform: true
            }
          }
        }
      }),
      prisma.userActivity.count({ where })
    ])

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * 获取用户活动数量
   */
  static async getUserActivitiesCount(userId: string, activityType?: string) {
    const where: Record<string, unknown> = { userId }
    if (activityType) {
      where.action = activityType
    }

    return await prisma.userActivity.count({ where })
  }

  /**
   * 删除特定类型的用户活动
   */
  static async deleteUserActivitiesByType(userId: string, activityType: string) {
    return await prisma.userActivity.deleteMany({
      where: {
        userId,
        action: activityType
      }
    })
  }

  /**
   * 删除特定的用户活动记录
   */
  static async deleteUserActivity(userId: string, activityId: string) {
    return await prisma.userActivity.deleteMany({
      where: {
        id: activityId,
        userId // 确保只能删除自己的记录
      }
    })
  }

  /**
   * 批量删除用户活动记录
   */
  static async batchDeleteUserActivities(userId: string, activityIds: string[]) {
    return await prisma.userActivity.deleteMany({
      where: {
        id: { in: activityIds },
        userId // 确保只能删除自己的记录
      }
    })
  }

  /**
   * 获取用户搜索统计
   */
  static async getUserSearchStats(userId: string, params: {
    startDate?: Date
    endDate?: Date
  }) {
    const { startDate, endDate } = params
    const where: Record<string, unknown> = {
      userId,
      action: 'search'
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      }
    }

    const [totalSearches, recentSearches] = await Promise.all([
      prisma.userActivity.count({ where }),
      prisma.userActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          metadata: true,
          createdAt: true
        }
      })
    ])

    // 分析搜索关键词频率
    const searchTerms = recentSearches
      .map(activity => {
        const metadata = activity.metadata as Record<string, unknown>
        return metadata?.searchQuery as string
      })
      .filter(Boolean)

    const termFrequency = searchTerms.reduce((acc: Record<string, number>, term: string) => {
      acc[term] = (acc[term] || 0) + 1
      return acc
    }, {})

    const topSearchTerms = Object.entries(termFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }))

    return {
      totalSearches,
      topSearchTerms,
      recentSearches: recentSearches.slice(0, 5)
    }
  }
}

// 导出默认的 prisma 实例和 DatabaseService 类
export { DatabaseService as db }