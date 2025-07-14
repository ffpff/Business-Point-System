import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
  name: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedFields = registerSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "验证失败",
          details: validatedFields.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validatedFields.data

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: "该邮箱已被注册" 
        },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        hashedPassword,
        subscriptionType: "free",
        usageLimit: 50,
        dailyUsageCount: 0,
        monthlyUsageCount: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionType: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: "注册成功！请登录您的账户。",
      data: user
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "注册失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}