import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DatabaseService } from "@/lib/db"
import { z } from "zod"

// 搜索历史查询Schema
const historyQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("20").transform(Number)
})

// 获取用户搜索历史
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
    
    const validatedParams = historyQuerySchema.safeParse(queryParams)
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

    const { page, limit } = validatedParams.data
    const validatedPage = Math.max(1, page)
    const validatedLimit = Math.min(Math.max(1, limit), 50)

    // 获取用户搜索历史
    const searchHistory = await getUserSearchHistory(
      session.user.id,
      validatedPage,
      validatedLimit
    )

    return NextResponse.json({
      success: true,
      data: searchHistory,
      meta: {
        page: validatedPage,
        limit: validatedLimit,
        total: searchHistory.total,
        totalPages: Math.ceil(searchHistory.total / validatedLimit),
        hasNextPage: validatedPage * validatedLimit < searchHistory.total,
        hasPrevPage: validatedPage > 1
      }
    })

  } catch (error) {
    console.error("搜索历史API错误:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "获取搜索历史失败" 
      },
      { status: 500 }
    )
  }
}

// 清除搜索历史
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "未认证，请先登录" },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { searchId, clearAll } = body

    if (clearAll) {
      // 清除所有搜索历史
      await clearUserSearchHistory(session.user.id)
      
      return NextResponse.json({
        success: true,
        message: "搜索历史已全部清除"
      })
    } else if (searchId) {
      // 删除特定搜索记录
      await deleteSearchRecord(session.user.id, searchId)
      
      return NextResponse.json({
        success: true,
        message: "搜索记录已删除"
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: "请提供要删除的搜索记录ID或设置clearAll为true" 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("删除搜索历史API错误:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "删除搜索历史失败" 
      },
      { status: 500 }
    )
  }
}

// 获取用户搜索历史实现
async function getUserSearchHistory(userId: string, page: number, limit: number) {
  // 从用户活动表中获取搜索记录
  const [activities, total] = await Promise.all([
    DatabaseService.getUserActivities(userId, {
      page,
      limit,
      activityType: 'search'
    }),
    DatabaseService.getUserActivitiesCount(userId, 'search')
  ])

  // 处理搜索历史数据
  const searchHistory = activities.activities.map(activity => {
    const metadata = activity.metadata as Record<string, unknown>
    return {
      id: activity.id,
      searchQuery: (metadata?.searchQuery as string) || '',
      searchType: (metadata?.searchType as string) || 'all',
      resultsCount: (metadata?.resultsCount as number) || 0,
      filters: (metadata?.filters as Record<string, unknown>) || {},
      searchedAt: activity.createdAt,
      // 简化的搜索结果预览
      preview: {
        hasResults: ((metadata?.resultsCount as number) || 0) > 0,
        totalResults: (metadata?.resultsCount as number) || 0
      }
    }
  })

  return {
    history: searchHistory,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

// 清除用户所有搜索历史
async function clearUserSearchHistory(userId: string) {
  // 删除所有搜索类型的用户活动记录
  await DatabaseService.deleteUserActivitiesByType(userId, 'search')
}

// 删除特定搜索记录
async function deleteSearchRecord(userId: string, searchId: string) {
  // 删除特定的搜索活动记录
  await DatabaseService.deleteUserActivity(userId, searchId)
}