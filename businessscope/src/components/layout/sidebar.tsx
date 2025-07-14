'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { 
  Filter, 
  RotateCcw, 
  Twitter, 
  MessageSquare, 
  Zap, 
  Package,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react'
import type { Platform, FinalRate, SentimentLabel } from '@/types'

interface FilterState {
  platforms: Platform[]
  finalRates: FinalRate[]
  sentiments: SentimentLabel[]
  minScore: number
  dateRange: string
  hasAnalysis: boolean | null
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize filter state from URL params
  const [filters, setFilters] = useState<FilterState>({
    platforms: searchParams.get('platforms')?.split(',') as Platform[] || [],
    finalRates: searchParams.get('finalRates')?.split(',') as FinalRate[] || [],
    sentiments: searchParams.get('sentiments')?.split(',') as SentimentLabel[] || [],
    minScore: parseInt(searchParams.get('minScore') || '0'),
    dateRange: searchParams.get('dateRange') || 'all',
    hasAnalysis: searchParams.get('hasAnalysis') ? searchParams.get('hasAnalysis') === 'true' : null
  })

  const platformOptions = [
    { value: 'twitter' as Platform, label: 'Twitter', icon: Twitter, color: 'bg-blue-500' },
    { value: 'reddit' as Platform, label: 'Reddit', icon: MessageSquare, color: 'bg-orange-500' },
    { value: 'hackernews' as Platform, label: 'Hacker News', icon: Zap, color: 'bg-yellow-500' },
    { value: 'producthunt' as Platform, label: 'Product Hunt', icon: Package, color: 'bg-green-500' },
  ]

  const rateOptions = [
    { value: 'A' as FinalRate, label: 'A级 (优秀)', color: 'bg-green-500' },
    { value: 'B' as FinalRate, label: 'B级 (良好)', color: 'bg-blue-500' },
    { value: 'C' as FinalRate, label: 'C级 (一般)', color: 'bg-yellow-500' },
    { value: 'D' as FinalRate, label: 'D级 (较差)', color: 'bg-red-500' },
  ]

  const sentimentOptions = [
    { value: 'positive' as SentimentLabel, label: '积极', color: 'bg-green-500' },
    { value: 'neutral' as SentimentLabel, label: '中性', color: 'bg-gray-500' },
    { value: 'negative' as SentimentLabel, label: '消极', color: 'bg-red-500' },
  ]

  const dateRangeOptions = [
    { value: 'all', label: '全部时间' },
    { value: 'today', label: '今天' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'quarter', label: '本季度' },
  ]

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    if (updatedFilters.platforms.length > 0) {
      params.set('platforms', updatedFilters.platforms.join(','))
    }
    if (updatedFilters.finalRates.length > 0) {
      params.set('finalRates', updatedFilters.finalRates.join(','))
    }
    if (updatedFilters.sentiments.length > 0) {
      params.set('sentiments', updatedFilters.sentiments.join(','))
    }
    if (updatedFilters.minScore > 0) {
      params.set('minScore', updatedFilters.minScore.toString())
    }
    if (updatedFilters.dateRange !== 'all') {
      params.set('dateRange', updatedFilters.dateRange)
    }
    if (updatedFilters.hasAnalysis !== null) {
      params.set('hasAnalysis', updatedFilters.hasAnalysis.toString())
    }
    
    const query = searchParams.get('q')
    if (query) {
      params.set('q', query)
    }
    
    router.push(`/opportunities?${params.toString()}`)
  }

  const togglePlatform = (platform: Platform) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform]
    updateFilters({ platforms: newPlatforms })
  }

  const toggleRate = (rate: FinalRate) => {
    const newRates = filters.finalRates.includes(rate)
      ? filters.finalRates.filter(r => r !== rate)
      : [...filters.finalRates, rate]
    updateFilters({ finalRates: newRates })
  }

  const toggleSentiment = (sentiment: SentimentLabel) => {
    const newSentiments = filters.sentiments.includes(sentiment)
      ? filters.sentiments.filter(s => s !== sentiment)
      : [...filters.sentiments, sentiment]
    updateFilters({ sentiments: newSentiments })
  }

  const resetFilters = () => {
    const resetState: FilterState = {
      platforms: [],
      finalRates: [],
      sentiments: [],
      minScore: 0,
      dateRange: 'all',
      hasAnalysis: null
    }
    setFilters(resetState)
    
    const query = searchParams.get('q')
    if (query) {
      router.push(`/opportunities?q=${query}`)
    } else {
      router.push('/opportunities')
    }
  }

  const hasActiveFilters = filters.platforms.length > 0 || 
                          filters.finalRates.length > 0 || 
                          filters.sentiments.length > 0 || 
                          filters.minScore > 0 || 
                          filters.dateRange !== 'all' || 
                          filters.hasAnalysis !== null

  return (
    <aside className={`w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6 space-y-6">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <h2 className="font-semibold">筛选器</h2>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="w-4 h-4 mr-1" />
              重置
            </Button>
          )}
        </div>

        {/* Platform Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>内容平台</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformOptions.map((platform) => (
              <div key={platform.value} className="flex items-center space-x-3">
                <Checkbox
                  id={platform.value}
                  checked={filters.platforms.includes(platform.value)}
                  onCheckedChange={() => togglePlatform(platform.value)}
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                  <platform.icon className="w-4 h-4" />
                  <label htmlFor={platform.value} className="text-sm font-medium cursor-pointer">
                    {platform.label}
                  </label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rating Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">AI评分等级</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rateOptions.map((rate) => (
              <div key={rate.value} className="flex items-center space-x-3">
                <Checkbox
                  id={rate.value}
                  checked={filters.finalRates.includes(rate.value)}
                  onCheckedChange={() => toggleRate(rate.value)}
                />
                <div className="flex items-center space-x-2 flex-1">
                  <Badge 
                    variant="outline" 
                    className={`${rate.color} text-white border-0`}
                  >
                    {rate.value}
                  </Badge>
                  <label htmlFor={rate.value} className="text-sm cursor-pointer">
                    {rate.label}
                  </label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sentiment Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">情感倾向</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentimentOptions.map((sentiment) => (
              <div key={sentiment.value} className="flex items-center space-x-3">
                <Checkbox
                  id={sentiment.value}
                  checked={filters.sentiments.includes(sentiment.value)}
                  onCheckedChange={() => toggleSentiment(sentiment.value)}
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${sentiment.color}`} />
                  <label htmlFor={sentiment.value} className="text-sm cursor-pointer">
                    {sentiment.label}
                  </label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Score Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">最低评分</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>评分: {filters.minScore}</span>
                <span>100</span>
              </div>
              <Slider
                value={[filters.minScore]}
                onValueChange={(value) => updateFilters({ minScore: value[0] })}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Date Range Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>时间范围</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => updateFilters({ dateRange: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Analysis Status Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>分析状态</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="has-analysis"
                checked={filters.hasAnalysis === true}
                onCheckedChange={(checked) => updateFilters({ hasAnalysis: checked ? true : null })}
              />
              <label htmlFor="has-analysis" className="text-sm cursor-pointer">
                已分析
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="no-analysis"
                checked={filters.hasAnalysis === false}
                onCheckedChange={(checked) => updateFilters({ hasAnalysis: checked ? false : null })}
              />
              <label htmlFor="no-analysis" className="text-sm cursor-pointer">
                待分析
              </label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">已选筛选条件</h4>
            <div className="flex flex-wrap gap-2">
              {filters.platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platformOptions.find(p => p.value === platform)?.label}
                </Badge>
              ))}
              {filters.finalRates.map((rate) => (
                <Badge key={rate} variant="secondary" className="text-xs">
                  {rate}级
                </Badge>
              ))}
              {filters.sentiments.map((sentiment) => (
                <Badge key={sentiment} variant="secondary" className="text-xs">
                  {sentimentOptions.find(s => s.value === sentiment)?.label}
                </Badge>
              ))}
              {filters.minScore > 0 && (
                <Badge variant="secondary" className="text-xs">
                  评分≥{filters.minScore}
                </Badge>
              )}
              {filters.dateRange !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
                </Badge>
              )}
              {filters.hasAnalysis !== null && (
                <Badge variant="secondary" className="text-xs">
                  {filters.hasAnalysis ? '已分析' : '待分析'}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}