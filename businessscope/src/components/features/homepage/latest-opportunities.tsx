'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OpportunityCard } from '@/components/features/opportunities/opportunity-card'
import { ArrowRight, TrendingUp, Clock, Filter, Loader2 } from 'lucide-react'
import type { OpportunityWithAnalysis } from '@/types'
import Link from 'next/link'

// 模拟数据 - 在实际应用中应该从API获取
const mockOpportunities: OpportunityWithAnalysis[] = [
  {
    id: '1',
    platform: 'twitter',
    title: '新的AI代码生成工具正在兴起',
    content: '看到越来越多的开发者开始使用AI辅助编程，这个市场机会巨大。特别是针对特定领域的代码生成工具，比如API文档生成、测试用例生成等。',
    author: 'TechEnthusiast',
    publishedAt: new Date('2024-01-15T10:30:00Z'),
    collectedAt: new Date('2024-01-15T10:35:00Z'),
    likesCount: 234,
    sharesCount: 56,
    commentsCount: 78,
    viewCount: 1234,
    status: '已分析',
    createdAt: new Date('2024-01-15T10:35:00Z'),
    updatedAt: new Date('2024-01-15T10:35:00Z'),
    analysis: {
      id: '1',
      contentId: '1',
      sentimentLabel: 'positive',
      sentimentScore: 0.8,
      mainTopic: 'AI编程工具',
      keywords: ['AI', '代码生成', '开发者工具'],
      businessRate: 85,
      contentRate: 90,
      finalRate: 'A',
      reason: '市场需求大，技术可行性高，商业潜力巨大',
      confidence: 0.9,
      analyzedAt: new Date('2024-01-15T10:40:00Z'),
      createdAt: new Date('2024-01-15T10:40:00Z'),
      updatedAt: new Date('2024-01-15T10:40:00Z')
    }
  },
  {
    id: '2',
    platform: 'reddit',
    title: '小众SaaS产品的成功故事',
    content: '分享一个朋友做的垂直领域SaaS产品，专门服务于宠物医院管理，月收入已经达到5万美元。市场虽小但竞争少，客户忠诚度高。',
    author: 'IndieHacker',
    publishedAt: new Date('2024-01-15T09:15:00Z'),
    collectedAt: new Date('2024-01-15T09:20:00Z'),
    likesCount: 189,
    sharesCount: 34,
    commentsCount: 45,
    viewCount: 890,
    status: '已分析',
    createdAt: new Date('2024-01-15T09:20:00Z'),
    updatedAt: new Date('2024-01-15T09:20:00Z'),
    analysis: {
      id: '2',
      contentId: '2',
      sentimentLabel: 'positive',
      sentimentScore: 0.9,
      mainTopic: '垂直SaaS',
      keywords: ['SaaS', '垂直市场', '宠物医院'],
      businessRate: 78,
      contentRate: 85,
      finalRate: 'B',
      reason: '垂直市场机会，需要深度行业知识',
      confidence: 0.8,
      analyzedAt: new Date('2024-01-15T09:25:00Z'),
      createdAt: new Date('2024-01-15T09:25:00Z'),
      updatedAt: new Date('2024-01-15T09:25:00Z')
    }
  },
  {
    id: '3',
    platform: 'hackernews',
    title: '开源项目商业化的新思路',
    content: '讨论如何将开源项目转化为可持续的商业模式，不仅仅是传统的支持服务，还包括云托管、企业版功能、培训服务等多种方式。',
    author: 'OpenSourcePro',
    publishedAt: new Date('2024-01-15T08:45:00Z'),
    collectedAt: new Date('2024-01-15T08:50:00Z'),
    likesCount: 156,
    sharesCount: 23,
    commentsCount: 67,
    viewCount: 2100,
    status: '已分析',
    createdAt: new Date('2024-01-15T08:50:00Z'),
    updatedAt: new Date('2024-01-15T08:50:00Z'),
    analysis: {
      id: '3',
      contentId: '3',
      sentimentLabel: 'neutral',
      sentimentScore: 0.6,
      mainTopic: '开源商业化',
      keywords: ['开源', '商业模式', '可持续发展'],
      businessRate: 72,
      contentRate: 80,
      finalRate: 'B',
      reason: '需要技术背景和社区运营能力',
      confidence: 0.7,
      analyzedAt: new Date('2024-01-15T08:55:00Z'),
      createdAt: new Date('2024-01-15T08:55:00Z'),
      updatedAt: new Date('2024-01-15T08:55:00Z')
    }
  },
  {
    id: '4',
    platform: 'producthunt',
    title: '远程工作工具的新趋势',
    content: '随着远程工作的普及，专门针对远程团队的协作工具需求激增。特别是异步沟通和项目管理工具，市场空间巨大。',
    author: 'RemoteWorker',
    publishedAt: new Date('2024-01-15T07:30:00Z'),
    collectedAt: new Date('2024-01-15T07:35:00Z'),
    likesCount: 201,
    sharesCount: 45,
    commentsCount: 89,
    viewCount: 1560,
    status: '已分析',
    createdAt: new Date('2024-01-15T07:35:00Z'),
    updatedAt: new Date('2024-01-15T07:35:00Z'),
    analysis: {
      id: '4',
      contentId: '4',
      sentimentLabel: 'positive',
      sentimentScore: 0.85,
      mainTopic: '远程工作工具',
      keywords: ['远程工作', '协作工具', '异步沟通'],
      businessRate: 80,
      contentRate: 88,
      finalRate: 'A',
      reason: '市场需求持续增长，技术门槛适中',
      confidence: 0.85,
      analyzedAt: new Date('2024-01-15T07:40:00Z'),
      createdAt: new Date('2024-01-15T07:40:00Z'),
      updatedAt: new Date('2024-01-15T07:40:00Z')
    }
  }
]

const platforms = [
  { key: 'all', label: '全部', icon: '🌐' },
  { key: 'twitter', label: 'Twitter', icon: '🐦' },
  { key: 'reddit', label: 'Reddit', icon: '🔴' },
  { key: 'hackernews', label: 'HackerNews', icon: '🔶' },
  { key: 'producthunt', label: 'ProductHunt', icon: '🚀' }
]

export default function LatestOpportunities() {
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [opportunities, setOpportunities] = useState<OpportunityWithAnalysis[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 模拟API调用
    setLoading(true)
    setTimeout(() => {
      const filteredOpportunities = selectedPlatform === 'all' 
        ? mockOpportunities 
        : mockOpportunities.filter(op => op.platform === selectedPlatform)
      setOpportunities(filteredOpportunities)
      setLoading(false)
    }, 500)
  }, [selectedPlatform])

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform)
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题部分 */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            最新机会
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            发现最新的商业机会
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI实时分析各大平台的最新内容，为您筛选出最有价值的商业洞察
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</div>
              <div className="text-sm text-muted-foreground">今日新增</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">89%</div>
              <div className="text-sm text-muted-foreground">高质量内容</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4</div>
              <div className="text-sm text-muted-foreground">数据源平台</div>
            </CardContent>
          </Card>
        </div>

        {/* 平台筛选 */}
        <Tabs value={selectedPlatform} onValueChange={handlePlatformChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {platforms.map(platform => (
              <TabsTrigger key={platform.key} value={platform.key} className="flex items-center gap-2">
                <span>{platform.icon}</span>
                <span className="hidden sm:inline">{platform.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {platforms.map(platform => (
            <TabsContent key={platform.key} value={platform.key}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">加载中...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {opportunities.map(opportunity => (
                    <OpportunityCard 
                      key={opportunity.id} 
                      opportunity={opportunity} 
                      showPlatformBadge={selectedPlatform === 'all'} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* 操作按钮 */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/opportunities">
              <Button size="lg" className="px-8">
                <TrendingUp className="w-5 h-5 mr-2" />
                查看更多机会
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/opportunities?filter=trending">
              <Button size="lg" variant="outline" className="px-8">
                <Filter className="w-5 h-5 mr-2" />
                高级筛选
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            每天更新超过1000条商业机会，AI智能分析和评分
          </p>
        </div>
      </div>
    </section>
  )
}