'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { OpportunityHeader } from './opportunity-header'
import { AIAnalysisSection } from './ai-analysis-section'
import { RelatedOpportunities } from './related-opportunities'
import { ActionButtons } from './action-buttons'
import { useOpportunity } from '@/hooks/use-api'

interface OpportunityDetailContentProps {
  id: string
}

export function OpportunityDetailContent({ id }: OpportunityDetailContentProps) {
  useSession() // Keep session for future auth-related features
  const router = useRouter()

  // 使用新的useOpportunity hook
  const { data: response, loading, error, refetch } = useOpportunity(id)
  
  // 从API响应中提取机会数据
  const opportunity = response?.opportunity || null

  const handleBookmarkChange = () => {
    // 触发重新获取数据以更新收藏状态
    refetch()
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
              <Button onClick={refetch}>重试</Button>
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
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <OpportunityHeader opportunity={opportunity as any} />

      {/* AI分析结果 */}
      {opportunity.analysis && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <AIAnalysisSection analysis={opportunity.analysis as any} />
      )}

      {/* 操作按钮 */}
      <ActionButtons 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        opportunity={opportunity as any} 
        onBookmarkChange={handleBookmarkChange}
      />

      {/* 相关机会推荐 */}
      <RelatedOpportunities 
        currentId={opportunity.id}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        platform={opportunity.platform as any}
        tags={opportunity.tags}
      />
    </div>
  )
}