import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { registerLimiter } from "@/lib/rate-limiter"

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string()
    .min(6, "密码至少需要6个字符")
    .max(50, "密码不能超过50个字符")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密码必须包含大小写字母和数字"),
  name: z.string().min(2, "姓名至少2个字符").max(50, "姓名不能超过50个字符").optional(),
})

export async function POST(request: Request) {
  try {
    // 获取客户端IP地址
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
    
    // 速率限制检查
    const rateLimitResult = registerLimiter.check(ip)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "注册请求过于频繁，请稍后重试",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

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
          error: "注册失败，请检查信息后重试" 
        },
        { status: 400 }
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