import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'

/**
 * 获取用户使用统计数据
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未认证，请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '30' // 默认30天

    // 验证时间范围参数
    const validRanges = ['7', '30', '90', '365']
    if (!validRanges.includes(timeRange)) {
      return NextResponse.json(
        { success: false, error: '无效的时间范围，支持7/30/90/365天' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const user = await DatabaseService.getUserByEmail(session.user.email!)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 计算时间范围
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(timeRange))

    // 获取基础使用统计
    const basicStats = {
      dailyUsageCount: user.dailyUsageCount,
      monthlyUsageCount: user.monthlyUsageCount,
      usageLimit: user.usageLimit,
      remainingUsage: Math.max(0, user.usageLimit - user.monthlyUsageCount),
      subscriptionType: user.subscriptionType,
      lastActiveAt: user.lastActiveAt
    }

    // 获取用户活动记录
    const userActivities = await DatabaseService.getUserActivitiesInRange(
      user.id, 
      startDate, 
      endDate
    )

    // 获取收藏统计
    const bookmarkStats = await DatabaseService.getUserBookmarkStats(user.id)

    // 获取用户仪表板统计（包含收藏数量）
    const dashboardStats = await DatabaseService.getDashboardStats(user.id)

    // 分析活动类型分布
    const activityAnalysis = analyzeUserActivities(userActivities)

    // 记录查看统计的活动
    await DatabaseService.logUserActivity({
      userId: user.id,
      action: 'view_usage_stats',
      metadata: { timeRange }
    })

    return NextResponse.json({
      success: true,
      data: {
        basicStats,
        dashboardStats,
        bookmarkStats,
        activityAnalysis,
        timeRange: {
          days: parseInt(timeRange),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('获取使用统计失败:', error)
    return NextResponse.json(
      { success: false, error: '获取使用统计失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 分析用户活动数据
 */
function analyzeUserActivities(activities: Array<{
  action: string
  createdAt: Date
  [key: string]: unknown
}>) {
  const actionCounts: Record<string, number> = {}
  const dailyCounts: Record<string, number> = {}

  activities.forEach(activity => {
    // 统计行为类型
    actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1

    // 统计每日活动
    const date = activity.createdAt.toISOString().split('T')[0]
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  return {
    totalActivities: activities.length,
    actionDistribution: Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([action, count]) => ({ action, count })),
    dailyActivity: Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    mostActiveDate: Object.entries(dailyCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null,
    averageDailyActivity: activities.length > 0 
      ? Math.round(activities.length / Object.keys(dailyCounts).length * 10) / 10
      : 0
  }
}