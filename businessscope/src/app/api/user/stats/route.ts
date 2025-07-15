import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未认证，请先登录' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 获取用户统计数据
    const dashboardStats = await DatabaseService.getDashboardStats(userId)
    
    // 计算今日浏览量
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayActivities = await DatabaseService.getUserActivitiesInRange(userId, today, tomorrow)
    const todayViewed = todayActivities.filter(activity => activity.action === 'view').length
    
    // 计算本周浏览量
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weeklyActivities = await DatabaseService.getUserActivitiesInRange(userId, weekStart, new Date())
    const weeklyViewed = weeklyActivities.filter(activity => activity.action === 'view').length
    
    // 获取用户收藏数量
    const bookmarksResult = await DatabaseService.getUserBookmarks(userId, { page: 1, limit: 1 })
    
    // 计算使用进度（基于本周使用情况）
    const usageProgress = Math.min((weeklyViewed / 100) * 100, 100)
    
    // 计算连续使用天数（简化计算）
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentActivities = await DatabaseService.getUserActivitiesInRange(userId, last30Days, new Date())
    
    const activityDates = new Set(
      recentActivities.map(activity => 
        new Date(activity.createdAt).toDateString()
      )
    )
    
    // 计算连续天数（从今天往前）
    let streakDays = 0
    const currentDate = new Date()
    
    while (streakDays < 30) {
      if (activityDates.has(currentDate.toDateString())) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    // 获取最喜欢的平台 - 使用时间范围参数
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const platformStats = await DatabaseService.getPlatformStats({
      startDate: lastWeek,
      endDate: new Date()
    })
    const favoriteplatform = platformStats.length > 0 ? platformStats[0].platform : 'Twitter'
    
    const stats = {
      totalViewed: recentActivities.length,
      totalBookmarks: bookmarksResult.total,
      todayViewed,
      weeklyViewed,
      averageScore: dashboardStats.averageScore || 0,
      favoriteplatform,
      usageProgress,
      streakDays
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取统计数据失败，请稍后重试' },
      { status: 500 }
    )
  }
}