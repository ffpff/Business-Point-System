import { PrismaClient } from '@prisma/client'

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
  Platform,
  ContentStatus,
  FinalRate
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
   * 获取平台分布统计
   */
  static async getPlatformStats() {
    const stats = await prisma.rawContent.groupBy({
      by: ['platform'],
      _count: {
        id: true
      }
    })

    return stats.reduce((acc: Record<Platform, number>, stat: {platform: string, _count: {id: number}}) => {
      acc[stat.platform as Platform] = stat._count.id
      return acc
    }, {} as Record<Platform, number>)
  }

  /**
   * 获取评分分布统计
   */
  static async getRateDistribution() {
    const stats = await prisma.aIAnalysis.groupBy({
      by: ['finalRate'],
      _count: {
        id: true
      },
      where: {
        finalRate: { not: null }
      }
    })

    return stats.reduce((acc: Record<FinalRate, number>, stat: {finalRate: string | null, _count: {id: number}}) => {
      if (stat.finalRate) {
        acc[stat.finalRate as FinalRate] = stat._count.id
      }
      return acc
    }, {} as Record<FinalRate, number>)
  }

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
}

// 导出默认的 prisma 实例和 DatabaseService 类
export { DatabaseService as db }