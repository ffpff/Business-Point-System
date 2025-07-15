'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { OpportunityHeader } from './opportunity-header'
import { AIAnalysisSection } from './ai-analysis-section'
import { RelatedOpportunities } from './related-opportunities'
import { ActionButtons } from './action-buttons'
import type { RawContent, AIAnalysis } from '@/types'

interface OpportunityDetailContentProps {
  id: string
}

interface OpportunityWithAnalysis extends RawContent {
  analysis?: AIAnalysis | null
  isBookmarked?: boolean
}

export function OpportunityDetailContent({ id }: OpportunityDetailContentProps) {
  const [opportunity, setOpportunity] = useState<OpportunityWithAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useSession() // Keep session for future auth-related features
  const router = useRouter()

  useEffect(() => {
    fetchOpportunity()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOpportunity = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/opportunities/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('机会不存在或已被删除')
        } else if (response.status === 401) {
          setError('请先登录后查看详情')
        } else {
          setError('获取机会详情失败，请稍后重试')
        }
        return
      }

      const data = await response.json()
      setOpportunity(data.opportunity)
    } catch (err) {
      console.error('Failed to fetch opportunity:', err)
      setError('网络错误，请检查连接')
    } finally {
      setLoading(false)
    }
  }

  const handleBookmarkChange = (isBookmarked: boolean) => {
    if (opportunity) {
      setOpportunity({ ...opportunity, isBookmarked })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">正在加载机会详情...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
        
        <Card className="p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">😞</div>
            <h2 className="text-xl font-semibold mb-2">加载失败</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchOpportunity}>重试</Button>
              <Button variant="outline" onClick={() => router.push('/opportunities')}>
                返回列表
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
        
        <Card className="p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">机会不存在</h2>
            <p className="text-muted-foreground mb-4">无法找到您要查看的机会</p>
            <Button onClick={() => router.push('/opportunities')}>
              返回列表
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>

      {/* 机会基本信息 */}
      <OpportunityHeader opportunity={opportunity} />

      {/* AI分析结果 */}
      {opportunity.analysis && (
        <AIAnalysisSection analysis={opportunity.analysis} />
      )}

      {/* 操作按钮 */}
      <ActionButtons 
        opportunity={opportunity} 
        onBookmarkChange={handleBookmarkChange}
      />

      {/* 相关机会推荐 */}
      <RelatedOpportunities 
        currentId={opportunity.id}
        platform={opportunity.platform}
        tags={opportunity.tags}
      />
    </div>
  )
}