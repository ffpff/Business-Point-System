'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { OpportunityCard } from './opportunity-card'
import { PaginationControls } from './pagination-controls'
import { LoadingSkeleton } from './loading-skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Filter } from 'lucide-react'
import type { Prisma } from '@prisma/client'

type OpportunityWithAnalysis = Prisma.RawContentGetPayload<{
  include: { analysis: true }
}>

interface ApiResponse {
  success: boolean
  data: {
    opportunities: OpportunityWithAnalysis[]
    total: number
  }
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

function OpportunitiesListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [opportunities, setOpportunities] = useState<OpportunityWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build API URL with current search params
      const apiUrl = new URL('/api/opportunities', window.location.origin)
      searchParams.forEach((value, key) => {
        apiUrl.searchParams.set(key, value)
      })
      
      // Ensure we have a page parameter
      if (!apiUrl.searchParams.has('page')) {
        apiUrl.searchParams.set('page', '1')
      }
      
      const response = await fetch(apiUrl.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.data?.toString() || '获取数据失败')
      }
      
      setOpportunities(result.data.opportunities)
      setMeta(result.meta)
      
    } catch (err) {
      console.error('Failed to fetch opportunities:', err)
      setError(err instanceof Error ? err.message : '获取机会列表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Fetch data when search params change
  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/opportunities?${params.toString()}`)
  }

  const handleRefresh = () => {
    fetchOpportunities()
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
              opportunity={opportunity}
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