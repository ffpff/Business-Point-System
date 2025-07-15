'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Bookmark, 
  TrendingUp, 
  Calendar,
  Star,
  BarChart3,
  Activity
} from 'lucide-react'

interface DashboardStats {
  totalViewed: number
  totalBookmarks: number
  todayViewed: number
  weeklyViewed: number
  averageScore: number
  favoriteplatform: string
  usageProgress: number
  streakDays: number
}

interface StatsOverviewProps {
  userId: string
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/user/stats')
        if (!response.ok) {
          throw new Error('获取统计数据失败')
        }
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        } else {
          throw new Error(data.error || '获取统计数据失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <Activity className="h-5 w-5" />
            <span>加载统计数据时出错：{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: '总浏览量',
      value: stats.totalViewed,
      description: '累计查看的商业机会',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `今日 +${stats.todayViewed}`
    },
    {
      title: '收藏总数',
      value: stats.totalBookmarks,
      description: '已收藏的商业机会',
      icon: Bookmark,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '保存的精选内容'
    },
    {
      title: '平均评分',
      value: `${stats.averageScore.toFixed(1)}`,
      description: '查看内容的AI评分',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '基于AI分析结果'
    },
    {
      title: '连续天数',
      value: stats.streakDays,
      description: '连续使用天数',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '保持活跃状态'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 核心统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {stat.title}
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {stat.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 详细统计信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 使用进度 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>使用情况</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>本周浏览进度</span>
                <span>{stats.weeklyViewed}/100</span>
              </div>
              <Progress value={Math.min((stats.weeklyViewed / 100) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>使用习惯</span>
                <Badge variant={stats.usageProgress > 80 ? "default" : "secondary"}>
                  {stats.usageProgress > 80 ? "活跃用户" : "普通用户"}
                </Badge>
              </div>
              <Progress value={stats.usageProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 偏好分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>偏好分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">最喜欢的平台</span>
              <Badge variant="outline">{stats.favoriteplatform}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">平均质量</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{stats.averageScore.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">探索深度</span>
              <Badge variant={stats.totalViewed > 50 ? "default" : "secondary"}>
                {stats.totalViewed > 50 ? "深度用户" : "轻度用户"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}