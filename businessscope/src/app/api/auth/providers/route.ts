import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 从authOptions中提取providers信息
    const providers = authOptions.providers.reduce((acc, provider) => {
      acc[provider.id] = {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        signinUrl: `/api/auth/signin/${provider.id}`,
        callbackUrl: `/api/auth/callback/${provider.id}`,
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(providers)
  } catch (error) {
    console.error('获取认证提供者失败:', error)
    return NextResponse.json(
      { error: '获取认证提供者失败' },
      { status: 500 }
    )
  }
}