'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Hash, 
  Clock, 
  Eye, 
  ArrowRight, 
  BarChart3,
  Zap,
  Flame,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface TrendingTopic {
  id: string
  topic: string
  mentions: number
  growth: number
  category: string
  platforms: string[]
  averageScore: number
  topContent: string
  timeRange: string
}

interface PlatformStats {
  platform: string
  count: number
  percentage: number
  color: string
  icon: string
}

// 模拟热门话题数据
const mockTrendingTopics: TrendingTopic[] = [
  {
    id: '1',
    topic: 'AI代码生成',
    mentions: 245,
    growth: 32.5,
    category: '人工智能',
    platforms: ['twitter', 'hackernews', 'reddit'],
    averageScore: 85,
    topContent: '新的AI代码生成工具正在兴起，市场机会巨大',
    timeRange: '24小时'
  },
  {
    id: '2',
    topic: '远程工作工具',
    mentions: 189,
    growth: 28.3,
    category: '工作效率',
    platforms: ['twitter', 'producthunt'],
    averageScore: 78,
    topContent: '远程工作工具需求激增，协作工具市场空间巨大',
    timeRange: '24小时'
  },
  {
    id: '3',
    topic: '垂直SaaS',
    mentions: 156,
    growth: 15.7,
    category: '软件服务',
    platforms: ['reddit', 'hackernews'],
    averageScore: 72,
    topContent: '小众SaaS产品成功故事，垂直市场机会显现',
    timeRange: '24小时'
  },
  {
    id: '4',
    topic: '开源商业化',
    mentions: 134,
    growth: 22.1,
    category: '开源项目',
    platforms: ['hackernews', 'twitter'],
    averageScore: 69,
    topContent: '开源项目商业化新思路，可持续发展模式探讨',
    timeRange: '24小时'
  },
  {
    id: '5',
    topic: '低代码平台',
    mentions: 112,
    growth: 18.9,
    category: '开发工具',
    platforms: ['twitter', 'producthunt', 'reddit'],
    averageScore: 75,
    topContent: '低代码平台助力业务数字化转型',
    timeRange: '24小时'
  }
]

// 模拟平台统计数据
const mockPlatformStats: PlatformStats[] = [
  { platform: 'Twitter', count: 456, percentage: 38, color: 'bg-blue-500', icon: '🐦' },
  { platform: 'Reddit', count: 321, percentage: 27, color: 'bg-orange-500', icon: '🔴' },
  { platform: 'HackerNews', count: 289, percentage: 24, color: 'bg-orange-600', icon: '🔶' },
  { platform: 'ProductHunt', count: 134, percentage: 11, color: 'bg-red-500', icon: '🚀' }
]

const categoryColors: Record<string, string> = {
  '人工智能': 'bg-blue-100 text-blue-800 border-blue-300',
  '工作效率': 'bg-green-100 text-green-800 border-green-300',
  '软件服务': 'bg-purple-100 text-purple-800 border-purple-300',
  '开源项目': 'bg-orange-100 text-orange-800 border-orange-300',
  '开发工具': 'bg-cyan-100 text-cyan-800 border-cyan-300'
}

export default function TrendingTopics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [topics, setTopics] = useState<TrendingTopic[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([])
  const [, setLoading] = useState(false)

  useEffect(() => {
    // 模拟API调用
    setLoading(true)
    setTimeout(() => {
      setTopics(mockTrendingTopics)
      setPlatformStats(mockPlatformStats)
      setLoading(false)
    }, 300)
  }, [selectedTimeRange])

  const getTrendIcon = (growth: number) => {
    if (growth > 20) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-blue-500" />
    return <TrendingDown className="w-4 h-4 text-red-500" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题部分 */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Flame className="w-4 h-4 mr-2" />
            热门趋势
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            把握市场脉搏
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            基于AI分析的实时热门话题和趋势，助您发现下一个商业机会
          </p>
        </div>

        {/* 时间范围选择 */}
        <Tabs value={selectedTimeRange} onValueChange={setSelectedTimeRange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 max-w-md mx-auto">
            <TabsTrigger value="24h">24小时</TabsTrigger>
            <TabsTrigger value="7d">7天</TabsTrigger>
            <TabsTrigger value="30d">30天</TabsTrigger>
            <TabsTrigger value="90d">90天</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTimeRange}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左侧：热门话题列表 */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    热门话题
                  </h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedTimeRange === '24h' ? '24小时' : selectedTimeRange === '7d' ? '7天' : selectedTimeRange === '30d' ? '30天' : '90天'}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {topics.map((topic, index) => (
                    <Card key={topic.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Hash className="w-4 h-4 text-muted-foreground" />
                                {topic.topic}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {topic.mentions} 提及
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={categoryColors[topic.category] || 'bg-gray-100 text-gray-800 border-gray-300'}
                                >
                                  {topic.category}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(topic.growth)}
                            <span className={`text-sm font-medium ${topic.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {topic.growth > 0 ? '+' : ''}{topic.growth}%
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {topic.topContent}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">平台：</span>
                            <div className="flex gap-1">
                              {topic.platforms.map(platform => (
                                <Badge key={platform} variant="outline" className="text-xs">
                                  {platform === 'twitter' && '🐦'}
                                  {platform === 'reddit' && '🔴'}
                                  {platform === 'hackernews' && '🔶'}
                                  {platform === 'producthunt' && '🚀'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">评分：</span>
                            <span className={`text-sm font-medium ${getScoreColor(topic.averageScore)}`}>
                              {topic.averageScore}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 右侧：平台统计 */}
              <div className="space-y-6">
                {/* 平台分布 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      平台分布
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {platformStats.map(stat => (
                        <div key={stat.platform} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              {stat.icon} {stat.platform}
                            </span>
                            <span className="text-sm text-muted-foreground">{stat.count}</span>
                          </div>
                          <Progress value={stat.percentage} className="h-2" />
                          <div className="text-xs text-muted-foreground text-right">
                            {stat.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 快速洞察 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      快速洞察
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            增长最快
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          AI代码生成 (+32.5%)
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">
                            最高评分
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          AI代码生成 (85分)
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            讨论最多
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          AI代码生成 (245次)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 操作按钮 */}
        <div className="text-center mt-8">
          <Link href="/opportunities?filter=trending">
            <Button size="lg" className="px-8">
              <TrendingUp className="w-5 h-5 mr-2" />
              查看详细趋势分析
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}