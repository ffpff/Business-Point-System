import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'
import { bookmarkSchema } from '@/lib/validations'
import { z } from 'zod'

/**
 * 获取用户收藏列表
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
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: '无效的分页参数' },
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

    // 获取用户收藏列表
    const result = await DatabaseService.getUserBookmarks(user.id, { page, limit })

    // 记录用户活动
    await DatabaseService.logUserActivity({
      userId: user.id,
      action: 'view_bookmarks',
      metadata: { page, limit }
    })

    return NextResponse.json({
      success: true,
      data: result.bookmarks,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    })

  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取收藏列表失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 添加收藏
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未认证，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // 验证请求数据
    const validatedData = bookmarkSchema.parse(body)

    // 获取用户信息
    const user = await DatabaseService.getUserByEmail(session.user.email!)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查内容是否存在
    const content = await DatabaseService.getOpportunityById(validatedData.contentId)
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: '内容不存在' },
        { status: 404 }
      )
    }

    // 检查是否已经收藏
    const isAlreadyBookmarked = await DatabaseService.isBookmarked(user.id, validatedData.contentId)
    
    if (isAlreadyBookmarked) {
      return NextResponse.json(
        { success: false, error: '已经收藏过该内容' },
        { status: 409 }
      )
    }

    // 添加收藏
    const bookmark = await DatabaseService.addBookmark(
      user.id, 
      validatedData.contentId, 
      validatedData.notes
    )

    // 记录用户活动
    await DatabaseService.logUserActivity({
      userId: user.id,
      action: 'add_bookmark',
      contentId: validatedData.contentId,
      metadata: {
        contentTitle: content.title,
        hasNotes: !!validatedData.notes
      }
    })

    return NextResponse.json({
      success: true,
      data: bookmark,
      message: '收藏成功'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '数据验证失败',
          details: error.issues 
        },
        { status: 400 }
      )
    }

    console.error('添加收藏失败:', error)
    return NextResponse.json(
      { success: false, error: '添加收藏失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 删除收藏 (支持批量删除)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未认证，请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // 支持单个删除和批量删除
    const contentIds = Array.isArray(body.contentIds) ? body.contentIds : [body.contentId]
    
    if (!contentIds || contentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少内容ID' },
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

    // 批量删除收藏
    const deleteResults = await Promise.all(
      contentIds.map((contentId: string) => 
        DatabaseService.removeBookmark(user.id, contentId)
      )
    )

    const deletedCount = deleteResults.reduce((sum, result) => sum + result.count, 0)

    // 记录用户活动
    await DatabaseService.logUserActivity({
      userId: user.id,
      action: 'remove_bookmarks',
      metadata: {
        contentIds,
        deletedCount
      }
    })

    return NextResponse.json({
      success: true,
      data: { deletedCount },
      message: `成功删除${deletedCount}个收藏`
    })

  } catch (error) {
    console.error('删除收藏失败:', error)
    return NextResponse.json(
      { success: false, error: '删除收藏失败，请稍后重试' },
      { status: 500 }
    )
  }
}