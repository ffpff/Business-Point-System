import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DatabaseService } from "@/lib/db"
import { z } from "zod"
import type { FilterState, Platform, FinalRate, SentimentLabel } from "@/types"

const opportunitiesQuerySchema = z.object({
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
  searchQuery: z.string().optional(),
  tags: z.string().optional(),
  hasAnalysis: z.string().optional().transform(val => val === "true"),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "未授权访问" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const validatedParams = opportunitiesQuerySchema.safeParse(queryParams)
    if (!validatedParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "查询参数无效",
          details: validatedParams.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const {
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
      searchQuery,
      tags,
      hasAnalysis
    } = validatedParams.data

    // 构建筛选条件
    const filters: FilterState = {}

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

    if (searchQuery) filters.searchQuery = searchQuery
    if (tags) filters.tags = tags.split(',')
    if (hasAnalysis !== undefined) filters.hasAnalysis = hasAnalysis

    // 限制分页参数
    const validatedPage = Math.max(1, page)
    const validatedLimit = Math.min(Math.max(1, limit), 100) // 最大100条

    const result = await DatabaseService.getOpportunities({
      page: validatedPage,
      limit: validatedLimit,
      filters
    })

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        page: validatedPage,
        limit: validatedLimit,
        total: result.total,
        totalPages: Math.ceil(result.total / validatedLimit),
        hasNextPage: validatedPage * validatedLimit < result.total,
        hasPrevPage: validatedPage > 1
      }
    })

  } catch (error) {
    console.error("Opportunities API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "获取机会列表失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}