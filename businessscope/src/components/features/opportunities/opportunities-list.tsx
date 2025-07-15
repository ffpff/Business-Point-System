'use client'

import { useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { OpportunityCard } from './opportunity-card'
import { PaginationControls } from './pagination-controls'
import { LoadingSkeleton } from './loading-skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Filter } from 'lucide-react'
import { useOpportunities } from '@/hooks/use-api'
import type { OpportunitiesQueryParams } from '@/lib/api'
import type { Platform, FinalRate, SentimentLabel } from '@/types'
import type { Prisma } from '@prisma/client'

type OpportunityCardType = Prisma.RawContentGetPayload<{
  include: { analysis: true }
}>

function OpportunitiesListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 将URL搜索参数转换为API查询参数
  const queryParams = useMemo((): OpportunitiesQueryParams => {
    const params: OpportunitiesQueryParams = {}
    
    // 分页参数
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    if (page) params.page = parseInt(page, 10)
    if (limit) params.limit = parseInt(limit, 10)
    
    // 平台筛选
    const platform = searchParams.get('platform')
    const platforms = searchParams.get('platforms')
    if (platform) {
      params.platform = [platform as Platform]
    } else if (platforms) {
      params.platform = platforms.split(',') as Platform[]
    }
    
    // 时间范围筛选
    const dateRange = searchParams.get('dateRange')
    if (dateRange) {
      const [start, end] = dateRange.split(',')
      if (start && end) {
        params.dateRange = {
          start: new Date(start),
          end: new Date(end)
        }
      }
    }
    
    // 评分筛选
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    if (minScore) params.minScore = parseFloat(minScore)
    if (maxScore) params.maxScore = parseFloat(maxScore)
    
    // 评级筛选
    const finalRate = searchParams.get('finalRate')
    const finalRates = searchParams.get('finalRates')
    if (finalRate) {
      params.finalRate = [finalRate as FinalRate]
    } else if (finalRates) {
      params.finalRate = finalRates.split(',') as FinalRate[]
    }
    
    // 情感标签筛选
    const sentimentLabel = searchParams.get('sentimentLabel')
    const sentimentLabels = searchParams.get('sentimentLabels')
    if (sentimentLabel) {
      params.sentimentLabel = [sentimentLabel as SentimentLabel]
    } else if (sentimentLabels) {
      params.sentimentLabel = sentimentLabels.split(',') as SentimentLabel[]
    }
    
    // 搜索关键词
    const searchQuery = searchParams.get('q') || searchParams.get('searchQuery')
    if (searchQuery) params.searchQuery = searchQuery
    
    // 标签筛选
    const tags = searchParams.get('tags')
    if (tags) params.tags = tags.split(',')
    
    // 是否有分析
    const hasAnalysis = searchParams.get('hasAnalysis')
    if (hasAnalysis) params.hasAnalysis = hasAnalysis === 'true'
    
    return params
  }, [searchParams])

  // 使用新的useOpportunities hook
  const { 
    opportunities, 
    loading, 
    error, 
    meta, 
    refetch 
  } = useOpportunities(queryParams)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/opportunities?${params.toString()}`)
  }

  const handleRefresh = () => {
    refetch()
  }

  const clearFilters = () => {
    const query = searchParams.get('q')
    if (query) {
      router.push(`/opportunities?q=${query}`)
    } else {
      router.push('/opportunities')
    }
  }

  // Check if any filters are active
  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([key, value]) => key !== 'page' && key !== 'q' && value
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">
              搜索结果
            </h2>
            <Badge variant="secondary">
              {meta.total.toLocaleString()} 条结果
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            第 {meta.page} 页，共 {meta.totalPages} 页
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              清除筛选
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* Search Query Display */}
      {searchParams.get('q') && (
        <Alert>
          <Search className="w-4 h-4" />
          <AlertDescription>
            搜索关键词: <strong>&quot;{searchParams.get('q')}&quot;</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Opportunities Grid */}
      {opportunities.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无结果</h3>
            <p className="text-muted-foreground mb-4">
              没有找到符合条件的商业机会，请尝试：
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-1 mb-4">
              <li>• 调整筛选条件</li>
              <li>• 更换搜索关键词</li>
              <li>• 扩大时间范围</li>
            </ul>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                清除所有筛选条件
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {opportunities.map((opportunity) => (
            <OpportunityCard 
              key={opportunity.id} 
              opportunity={opportunity as OpportunityCardType}
              showPlatformBadge={true}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {opportunities.length > 0 && (
        <PaginationControls
          currentPage={meta.page}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPrevPage={meta.hasPrevPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

export function OpportunitiesList() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <OpportunitiesListContent />
    </Suspense>
  )
}