import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DatabaseService } from "@/lib/db"
import { z } from "zod"

const trendingQuerySchema = z.object({
  days: z.string().optional().default("7").transform(Number),
  platform: z.string().optional(),
  limit: z.string().optional().default("10").transform(Number),
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
    
    const validatedParams = trendingQuerySchema.safeParse(queryParams)
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

    const { days, platform, limit } = validatedParams.data

    // 限制查询范围
    const validatedDays = Math.min(Math.max(1, days), 30) // 最多30天
    const validatedLimit = Math.min(Math.max(1, limit), 50) // 最多50条

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - validatedDays)

    // 获取趋势数据
    const [
      hotTopics,
      platformStats,
      rateDistribution,
      timeSeriesData
    ] = await Promise.all([
      // 热门话题/关键词
      DatabaseService.getHotTopics({
        startDate,
        endDate,
        platform,
        limit: validatedLimit
      }),
      
      // 平台统计
      DatabaseService.getPlatformStats({
        startDate,
        endDate,
        platform
      }),
      
      // 评分分布
      DatabaseService.getRateDistribution({
        startDate,
        endDate,
        platform
      }),
      
      // 时间序列数据
      DatabaseService.getTimeSeriesData({
        startDate,
        endDate,
        platform,
        interval: validatedDays <= 7 ? 'day' : 'week'
      })
    ])

    // 记录用户搜索行为
    await DatabaseService.logUserActivity({
      userId: session.user.id,
      action: "search",
      metadata: {
        type: "trending",
        days: validatedDays,
        platform,
        limit: validatedLimit
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        hotTopics,
        platformStats,
        rateDistribution,
        timeSeriesData,
        period: {
          days: validatedDays,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      },
      meta: {
        generatedAt: new Date().toISOString(),
        platform: platform || "all",
        totalDays: validatedDays
      }
    })

  } catch (error) {
    console.error("Trending API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "获取趋势数据失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}