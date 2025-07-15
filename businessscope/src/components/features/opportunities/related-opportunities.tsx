'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lightbulb, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OpportunityCard } from './opportunity-card'
import type { Prisma } from '@prisma/client'

type OpportunityWithAnalysis = Prisma.RawContentGetPayload<{
  include: { analysis: true }
}>

interface RelatedOpportunitiesProps {
  currentId: string
  platform?: string
  tags?: string | null
}

export function RelatedOpportunities({ currentId, platform, tags }: RelatedOpportunitiesProps) {
  const [relatedOpportunities, setRelatedOpportunities] = useState<OpportunityWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRelatedOpportunities()
  }, [currentId, platform, tags]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRelatedOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)

      // 构建查询参数
      const params = new URLSearchParams({
        limit: '4',
        exclude: currentId
      })

      // 添加平台筛选
      if (platform) {
        params.append('platform', platform)
      }

      // 添加关键词搜索（基于标签）
      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean)
        if (tagList.length > 0) {
          // 使用第一个标签作为关键词搜索
          params.append('q', tagList[0])
          params.append('searchType', 'tags')
        }
      }

      const response = await fetch(`/api/opportunities?${params}`)
      
      if (!response.ok) {
        throw new Error('获取相关机会失败')
      }

      const data = await response.json()
      setRelatedOpportunities(data.opportunities || [])
    } catch (err) {
      console.error('Failed to fetch related opportunities:', err)
      setError('获取相关机会失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            相关机会推荐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">正在加载相关机会...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            相关机会推荐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (relatedOpportunities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            相关机会推荐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm text-muted-foreground">
              暂无相关机会，可以去
              <Link href="/opportunities" className="text-primary hover:underline">
                机会列表
              </Link>
              查看更多内容
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          相关机会推荐
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          基于相同平台和标签为您推荐的相关商业机会
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              showPlatformBadge={true}
              compact={true}
            />
          ))}
        </div>

        {relatedOpportunities.length >= 4 && (
          <div className="text-center mt-6">
            <Link 
              href={`/opportunities${platform ? `?platform=${platform}` : ''}`}
              className="text-primary hover:underline text-sm"
            >
              查看更多 {platform} 机会 →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}