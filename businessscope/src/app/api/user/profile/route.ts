import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/db'
import { updateProfileSchema } from '@/lib/validations'
import { z } from 'zod'

/**
 * 获取用户资料信息
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '未认证，请先登录' },
        { status: 401 }
      )
    }

    const user = await DatabaseService.getUserByEmail(session.user.email!)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 去除敏感信息
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userProfile } = user

    return NextResponse.json({
      success: true,
      data: userProfile
    })

  } catch (error) {
    console.error('获取用户资料失败:', error)
    return NextResponse.json(
      { success: false, error: '获取用户资料失败，请稍后重试' },
      { status: 500 }
    )
  }
}

/**
 * 更新用户资料信息
 */
export async function PUT(request: NextRequest) {
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
    const validatedData = updateProfileSchema.parse(body)

    // 检查用户是否存在
    const existingUser = await DatabaseService.getUserByEmail(session.user.email!)
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 更新用户信息
    const updatedUser = await DatabaseService.updateUserProfile(existingUser.id, validatedData)

    // 去除敏感信息
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...userProfile } = updatedUser

    // 记录用户活动
    await DatabaseService.logUserActivity({
      userId: existingUser.id,
      action: 'profile_updated',
      metadata: {
        updatedFields: Object.keys(validatedData)
      }
    })

    return NextResponse.json({
      success: true,
      data: userProfile,
      message: '用户资料更新成功'
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

    console.error('更新用户资料失败:', error)
    return NextResponse.json(
      { success: false, error: '更新用户资料失败，请稍后重试' },
      { status: 500 }
    )
  }
}