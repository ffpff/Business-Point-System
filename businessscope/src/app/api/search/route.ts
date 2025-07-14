import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DatabaseService, prisma } from "@/lib/db"
import { z } from "zod"
import type { Platform, FinalRate, SentimentLabel } from "@/types"

// 搜索请求验证Schema
const searchQuerySchema = z.object({
  q: z.string().min(1, "搜索关键词不能为空").max(100, "搜索关键词过长"),
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("20").transform(Number),
  platform: z.string().optional(),
  platforms: z.string().optional(),
  dateRange: z.string().optional(),
  minScore: z.string().optional().transform(val => val ? Number(val) : undefined),
  maxScore: z.string().optional().transform(val => val ? Number(val) : undefined),
  finalRate: z.string().optional(),
  finalRates: z.string().optional(),
  sentimentLabel: z.string().optional(),
  sentimentLabels: z.string().optional(),
  tags: z.string().optional(),
  hasAnalysis: z.string().optional().transform(val => val === "true"),
  sortBy: z.enum(["relevance", "date", "score", "popularity"]).optional().default("relevance"),
  searchType: z.enum(["all", "title", "content", "author", "tags"]).optional().default("all")
})

// 高级搜索接口
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "未认证，请先登录" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedParams = searchQuerySchema.safeParse(queryParams)
    if (!validatedParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "搜索参数无效",
          details: validatedParams.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const {
      q: searchQuery,
      page,
      limit,
      platform,
      platforms,
      dateRange,
      minScore,
      maxScore,
      finalRate,
      finalRates,
      sentimentLabel,
      sentimentLabels,
      tags,
      hasAnalysis,
      sortBy,
      searchType
    } = validatedParams.data

    // 构建高级搜索条件
    const searchFilters = {
      searchQuery,
      searchType,
      sortBy
    }

    // 构建其他筛选条件
    const filters: Record<string, unknown> = {}

    if (platform) {
      filters.platform = [platform as Platform]
    } else if (platforms) {
      filters.platform = platforms.split(',') as Platform[]
    }

    if (dateRange) {
      const [start, end] = dateRange.split(',')
      if (start && end) {
        filters.dateRange = {
          start: new Date(start),
          end: new Date(end)
        }
      }
    }

    if (minScore !== undefined) filters.minScore = minScore
    if (maxScore !== undefined) filters.maxScore = maxScore

    if (finalRate) {
      filters.finalRate = [finalRate as FinalRate]
    } else if (finalRates) {
      filters.finalRate = finalRates.split(',') as FinalRate[]
    }

    if (sentimentLabel) {
      filters.sentimentLabel = [sentimentLabel as SentimentLabel]
    } else if (sentimentLabels) {
      filters.sentimentLabel = sentimentLabels.split(',') as SentimentLabel[]
    }

    if (tags) filters.tags = tags.split(',')
    if (hasAnalysis !== undefined) filters.hasAnalysis = hasAnalysis

    // 限制分页参数
    const validatedPage = Math.max(1, page)
    const validatedLimit = Math.min(Math.max(1, limit), 50) // 搜索结果限制为50条

    // 执行高级搜索
    const searchResults = await performAdvancedSearch({
      ...searchFilters,
      page: validatedPage,
      limit: validatedLimit,
      filters
    })

    // 记录搜索行为
    await DatabaseService.logUserActivity({
      userId: session.user.id,
      action: "search",
      contentId: undefined,
      metadata: {
        searchQuery,
        searchType,
        resultsCount: searchResults.total,
        filters
      }
    })

    // 返回搜索结果
    return NextResponse.json({
      success: true,
      data: searchResults,
      meta: {
        page: validatedPage,
        limit: validatedLimit,
        total: searchResults.total,
        totalPages: Math.ceil(searchResults.total / validatedLimit),
        hasNextPage: validatedPage * validatedLimit < searchResults.total,
        hasPrevPage: validatedPage > 1,
        searchQuery,
        searchType,
        sortBy
      }
    })

  } catch (error) {
    console.error("搜索API错误:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "搜索失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}

// 高级搜索实现
async function performAdvancedSearch(params: {
  searchQuery: string
  searchType: string
  sortBy: string
  page: number
  limit: number
  filters: Record<string, unknown>
}) {
  const { searchQuery, searchType, sortBy, page, limit, filters } = params
  const skip = (page - 1) * limit
  
  // 构建搜索条件
  const where: Record<string, unknown> = {}
  
  // 应用其他筛选条件
  if (Array.isArray(filters.platform) && filters.platform.length > 0) {
    where.platform = { in: filters.platform }
  }
  
  if (filters.dateRange && typeof filters.dateRange === 'object') {
    const dateRange = filters.dateRange as { start: Date; end: Date }
    where.collectedAt = {
      gte: dateRange.start,
      lte: dateRange.end
    }
  }
  
  if (Array.isArray(filters.finalRate) && filters.finalRate.length > 0) {
    where.analysis = {
      finalRate: { in: filters.finalRate }
    }
  }
  
  if (Array.isArray(filters.sentimentLabel) && filters.sentimentLabel.length > 0) {
    where.analysis = {
      ...(where.analysis as Record<string, unknown> || {}),
      sentimentLabel: { in: filters.sentimentLabel }
    }
  }
  
  if (filters.minScore !== undefined || filters.maxScore !== undefined) {
    where.analysis = {
      ...(where.analysis as Record<string, unknown> || {}),
      businessRate: {
        ...(filters.minScore !== undefined && { gte: filters.minScore }),
        ...(filters.maxScore !== undefined && { lte: filters.maxScore })
      }
    }
  }
  
  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    where.tags = {
      in: filters.tags
    }
  }
  
  if (filters.hasAnalysis !== undefined) {
    if (filters.hasAnalysis) {
      where.analysis = { isNot: null }
    } else {
      where.analysis = null
    }
  }

  // 构建搜索查询条件
  const searchConditions = []
  
  switch (searchType) {
    case 'title':
      searchConditions.push({ title: { contains: searchQuery, mode: 'insensitive' } })
      break
    case 'content':
      searchConditions.push({ content: { contains: searchQuery, mode: 'insensitive' } })
      break
    case 'author':
      searchConditions.push({ author: { contains: searchQuery, mode: 'insensitive' } })
      break
    case 'tags':
      searchConditions.push({ tags: { contains: searchQuery, mode: 'insensitive' } })
      break
    case 'all':
    default:
      searchConditions.push(
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } },
        { author: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { contains: searchQuery, mode: 'insensitive' } }
      )
      // 在AI分析中搜索主题和关键词
      searchConditions.push({
        analysis: {
          OR: [
            { mainTopic: { contains: searchQuery, mode: 'insensitive' } },
            { keywords: { has: searchQuery } },
            { reason: { contains: searchQuery, mode: 'insensitive' } }
          ]
        }
      })
      break
  }
  
  if (searchConditions.length > 0) {
    where.OR = searchConditions
  }

  // 构建排序条件
  let orderBy: Record<string, unknown> | Array<Record<string, unknown>> = { collectedAt: 'desc' } // 默认按时间排序
  
  switch (sortBy) {
    case 'date':
      orderBy = { collectedAt: 'desc' }
      break
    case 'score':
      orderBy = { analysis: { businessRate: 'desc' } }
      break
    case 'popularity':
      orderBy = [
        { likesCount: 'desc' },
        { sharesCount: 'desc' },
        { viewCount: 'desc' }
      ]
      break
    case 'relevance':
    default:
      // 相关性排序：优先显示标题匹配的内容
      orderBy = [
        { 
          // 使用原始字段进行相关性评分，这里简化为按时间排序
          collectedAt: 'desc' 
        }
      ]
      break
  }

  // 执行查询
  const [opportunities, total] = await Promise.all([
    prisma.rawContent.findMany({
      where,
      include: {
        analysis: true
      },
      orderBy,
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