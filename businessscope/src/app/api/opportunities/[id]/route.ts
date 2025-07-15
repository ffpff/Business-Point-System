import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DatabaseService } from "@/lib/db"
import { z } from "zod"

const opportunityParamsSchema = z.object({
  id: z.string().min(1, "机会ID不能为空")
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "未授权访问" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const validatedParams = opportunityParamsSchema.safeParse(resolvedParams)
    if (!validatedParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "无效的机会ID",
          details: validatedParams.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { id } = validatedParams.data

    const opportunity = await DatabaseService.getOpportunityById(id)

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "机会不存在" },
        { status: 404 }
      )
    }

    // 检查用户是否收藏了这个机会
    const isBookmarked = await DatabaseService.isBookmarked(session.user.id, id)

    // 记录用户查看行为
    await DatabaseService.logUserActivity({
      userId: session.user.id,
      action: "view",
      contentId: id,
      metadata: {
        platform: opportunity.platform,
        hasAnalysis: !!opportunity.analysis
      }
    })

    return NextResponse.json({
      success: true,
      opportunity: {
        ...opportunity,
        isBookmarked
      }
    })

  } catch (error) {
    console.error("Opportunity detail API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "获取机会详情失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "未授权访问" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const validatedParams = opportunityParamsSchema.safeParse(resolvedParams)
    if (!validatedParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "无效的机会ID",
          details: validatedParams.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { id } = validatedParams.data
    const body = await request.json()

    const updateSchema = z.object({
      action: z.enum(["bookmark", "unbookmark"]),
      notes: z.string().optional()
    })

    const validatedBody = updateSchema.safeParse(body)
    if (!validatedBody.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "请求数据无效",
          details: validatedBody.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { action, notes } = validatedBody.data

    // 检查机会是否存在
    const opportunity = await DatabaseService.getOpportunityById(id)
    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "机会不存在" },
        { status: 404 }
      )
    }

    let result
    if (action === "bookmark") {
      result = await DatabaseService.addBookmark(session.user.id, id, notes)
      
      // 记录收藏行为
      await DatabaseService.logUserActivity({
        userId: session.user.id,
        action: "bookmark",
        contentId: id,
        metadata: {
          platform: opportunity.platform,
          notes
        }
      })
    } else {
      result = await DatabaseService.removeBookmark(session.user.id, id)
      
      // 记录取消收藏行为
      await DatabaseService.logUserActivity({
        userId: session.user.id,
        action: "bookmark",
        contentId: id,
        metadata: {
          platform: opportunity.platform,
          action: "remove"
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: action === "bookmark" ? "收藏成功" : "取消收藏成功",
      data: result
    })

  } catch (error) {
    console.error("Opportunity update API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "操作失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}