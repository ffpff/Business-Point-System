import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DatabaseService } from '@/lib/db'
import { webhookDataSchema } from '@/lib/validations'
import type { WebhookData } from '@/lib/validations'
import crypto from 'crypto'

/**
 * 安全验证函数
 */
function verifyWebhookSecurity(request: NextRequest): { valid: boolean; error?: string } {
  // 1. 验证请求方法
  if (request.method !== 'POST') {
    return { valid: false, error: '仅支持POST请求' }
  }

  // 2. 验证Content-Type
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return { valid: false, error: '请求内容类型必须为 application/json' }
  }

  // 3. 验证User-Agent（可选）
  const userAgent = request.headers.get('user-agent')
  if (process.env.WEBHOOK_REQUIRE_USER_AGENT && !userAgent) {
    return { valid: false, error: '缺少User-Agent头' }
  }

  // 4. 验证webhook密钥
  const webhookSecret = request.headers.get('x-webhook-secret')
  if (process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
    return { valid: false, error: '无效的webhook密钥' }
  }

  // 5. 验证来源标识（可选）
  const n8nSource = request.headers.get('x-n8n-source')
  if (process.env.WEBHOOK_REQUIRE_N8N_SOURCE && !n8nSource) {
    return { valid: false, error: '缺少n8n来源标识' }
  }

  // 6. IP白名单检查（可选）
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  if (process.env.WEBHOOK_ALLOWED_IPS) {
    const allowedIPs = process.env.WEBHOOK_ALLOWED_IPS.split(',').map(ip => ip.trim())
    if (!allowedIPs.includes(clientIP)) {
      return { valid: false, error: 'IP地址不在允许列表中' }
    }
  }

  return { valid: true }
}

/**
 * 生成请求签名用于日志记录
 */
function generateRequestSignature(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

/**
 * N8N Webhook接收API
 * 接收来自n8n工作流的原始内容数据，进行验证和清洗后写入数据库
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  try {
    // 安全验证
    const securityCheck = verifyWebhookSecurity(request)
    if (!securityCheck.valid) {
      console.warn(`Webhook安全验证失败: ${securityCheck.error}, IP: ${clientIP}`)
      return NextResponse.json(
        { 
          success: false, 
          error: securityCheck.error 
        },
        { status: 401 }
      )
    }

    // 解析请求体
    let requestData: unknown
    let requestBody: string
    try {
      requestBody = await request.text()
      requestData = JSON.parse(requestBody)
    } catch (error) {
      console.error(`JSON解析失败, IP: ${clientIP}, 错误:`, error)
      return NextResponse.json(
        { 
          success: false, 
          error: '无效的JSON格式' 
        },
        { status: 400 }
      )
    }

    // 生成请求签名用于日志记录
    const requestSignature = generateRequestSignature(requestBody)

    // 验证数据格式
    let validatedData: WebhookData
    try {
      validatedData = webhookDataSchema.parse(requestData)
    } catch (error) {
      console.error(`Webhook数据验证失败, IP: ${clientIP}, 签名: ${requestSignature}, 错误:`, error)
      return NextResponse.json(
        { 
          success: false, 
          error: '数据格式验证失败',
          details: error instanceof z.ZodError ? error.issues : undefined
        },
        { status: 400 }
      )
    }

    console.log(`收到Webhook请求: 平台=${validatedData.platform}, 数据量=${validatedData.data.length}, IP=${clientIP}, 签名=${requestSignature}`)

    // 数据清洗和转换
    const cleanedData = validatedData.data.map(item => ({
      platform: validatedData.platform,
      originalUrl: item.originalUrl || undefined,
      title: item.title || undefined,
      content: item.content || undefined,
      author: item.author || undefined,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      collectedAt: new Date(validatedData.timestamp),
      likesCount: item.likesCount,
      sharesCount: item.sharesCount,
      commentsCount: item.commentsCount,
      viewCount: item.viewCount,
      tags: item.tags || undefined,
      status: '待处理' as const
    }))

    // 过滤掉无效数据（标题和内容都为空的）
    const validData = cleanedData.filter(item => 
      item.title || item.content
    )

    if (validData.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '没有有效的内容数据' 
        },
        { status: 400 }
      )
    }

    // 批量写入数据库
    try {
      const dbStartTime = Date.now()
      const result = await DatabaseService.createManyRawContent(validData)
      const dbEndTime = Date.now()
      const processingTime = Date.now() - startTime
      
      console.log(`Webhook处理成功: 平台=${validatedData.platform}, 接收=${validatedData.data.length}, 有效=${validData.length}, 插入=${result.count}, 数据库耗时=${dbEndTime - dbStartTime}ms, 总耗时=${processingTime}ms, IP=${clientIP}, 签名=${requestSignature}`)
      
      return NextResponse.json({
        success: true,
        data: {
          platform: validatedData.platform,
          received: validatedData.data.length,
          processed: validData.length,
          inserted: result.count,
          timestamp: validatedData.timestamp,
          processingTime: processingTime
        },
        message: `成功处理 ${result.count} 条 ${validatedData.platform} 平台数据`
      })
      
    } catch (dbError) {
      console.error(`数据库写入失败, IP: ${clientIP}, 签名: ${requestSignature}, 错误:`, dbError)
      return NextResponse.json(
        { 
          success: false, 
          error: '数据库写入失败，请稍后重试',
          details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
        },
        { status: 500 }
      )
    }

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error(`Webhook处理异常, IP: ${clientIP}, 耗时: ${processingTime}ms, 错误:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * 健康检查端点
 */
export async function GET() {
  try {
    // 简单的数据库连接检查
    const dbHealthCheck = await DatabaseService.healthCheck()
    
    return NextResponse.json({
      success: true,
      message: 'N8N Webhook API 运行正常',
      timestamp: new Date().toISOString(),
      database: dbHealthCheck.healthy ? 'connected' : 'disconnected',
      security: {
        webhookSecretConfigured: !!process.env.WEBHOOK_SECRET,
        ipWhitelistConfigured: !!process.env.WEBHOOK_ALLOWED_IPS,
        n8nSourceRequired: !!process.env.WEBHOOK_REQUIRE_N8N_SOURCE,
        userAgentRequired: !!process.env.WEBHOOK_REQUIRE_USER_AGENT
      },
      endpoints: {
        'POST /api/webhooks/n8n': '接收n8n推送的内容数据',
        'GET /api/webhooks/n8n': '健康检查'
      },
      supportedPlatforms: ['twitter', 'reddit', 'hackernews', 'producthunt']
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '健康检查失败',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : '服务器内部错误'
    }, { status: 500 })
  }
}