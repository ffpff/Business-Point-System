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

    // 获取最近7天的数据
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      return date
    }).reverse()

    // 获取每日数据
    const dailyData = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date)
        nextDay.setDate(date.getDate() + 1)
        
        const activities = await DatabaseService.getUserActivitiesInRange(userId, date, nextDay)
        
        const views = activities.filter(a => a.action === 'view').length
        const bookmarks = activities.filter(a => a.action === 'bookmark').length
        const searches = activities.filter(a => a.action === 'search').length
        
        return {
          date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          views,
          bookmarks,
          searches
        }
      })
    )

    // 获取最近4周的数据
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (i + 1) * 7)
      date.setHours(0, 0, 0, 0)
      return date
    }).reverse()

    const weeklyData = await Promise.all(
      last4Weeks.map(async (weekStart, index) => {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)
        
        const activities = await DatabaseService.getUserActivitiesInRange(userId, weekStart, weekEnd)
        
        const views = activities.filter(a => a.action === 'view').length
        const bookmarks = activities.filter(a => a.action === 'bookmark').length
        const searches = activities.filter(a => a.action === 'search').length
        
        return {
          week: `第${4-index}周`,
          views,
          bookmarks,
          searches
        }
      })
    )

    // 获取平台分布数据
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    
    const recentActivities = await DatabaseService.getUserActivitiesInRange(userId, last30Days, new Date())
    const viewActivities = recentActivities.filter(activity => activity.action === 'view')
    
    // 统计平台分布
    const platformCounts: Record<string, number> = {}
    let totalCount = 0
    
    viewActivities.forEach(activity => {
      const metadata = activity.metadata as Record<string, unknown> || {}
      const platform = (metadata.platform as string) || '未知'
      platformCounts[platform] = (platformCounts[platform] || 0) + 1
      totalCount++
    })
    
    const platformDistribution = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    })).sort((a, b) => b.count - a.count)

    const chartData = {
      daily: dailyData,
      weekly: weeklyData,
      platformDistribution
    }

    return NextResponse.json({
      success: true,
      data: chartData
    })
  } catch (error) {
    console.error('获取使用图表数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取图表数据失败，请稍后重试' },
      { status: 500 }
    )
  }
}