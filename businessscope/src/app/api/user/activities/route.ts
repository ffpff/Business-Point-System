import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'

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
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const result = await DatabaseService.getUserActivities(session.user.id, {
      page,
      limit
    })

    // 格式化活动数据
    const formattedActivities = result.activities.map(activity => {
      const metadata = activity.metadata as Record<string, unknown> || {}
      return {
        id: activity.id,
        type: activity.action,
        title: metadata.title || activity.content?.title || '未知内容',
        description: metadata.description || `${activity.action === 'view' ? '查看了' : activity.action === 'bookmark' ? '收藏了' : activity.action === 'search' ? '搜索了' : '进行了'} ${activity.content?.title || '内容'}`,
        createdAt: activity.createdAt,
        metadata: {
          platform: activity.content?.platform || metadata.platform,
          score: metadata.score,
          searchQuery: metadata.searchQuery
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedActivities,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    })
  } catch (error) {
    console.error('获取用户活动记录失败:', error)
    return NextResponse.json(
      { success: false, error: '获取活动记录失败，请稍后重试' },
      { status: 500 }
    )
  }
}