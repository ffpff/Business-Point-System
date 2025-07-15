'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Bookmark, 
  Search,
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Activity {
  id: string
  type: 'view' | 'bookmark' | 'search'
  title: string
  description: string
  createdAt: string
  metadata?: {
    platform?: string
    score?: number
    searchQuery?: string
  }
}

interface RecentActivityProps {
  userId: string
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/api/user/activities?limit=10')
        if (!response.ok) {
          throw new Error('获取活动记录失败')
        }
        const data = await response.json()
        if (data.success) {
          setActivities(data.data)
        } else {
          throw new Error(data.error || '获取活动记录失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'bookmark':
        return <Bookmark className="h-4 w-4 text-green-600" />
      case 'search':
        return <Search className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityLabel = (type: Activity['type']) => {
    switch (type) {
      case 'view':
        return '查看了'
      case 'bookmark':
        return '收藏了'
      case 'search':
        return '搜索了'
      default:
        return '进行了'
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'view':
        return 'bg-blue-50 border-blue-200'
      case 'bookmark':
        return 'bg-green-50 border-green-200'
      case 'search':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>最近活动</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span>最近活动</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <Clock className="h-5 w-5" />
            <span>加载活动记录时出错：{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          <span>最近活动</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>暂无活动记录</p>
            <p className="text-sm">开始探索商业机会吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getActivityLabel(activity.type)} {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        
                        {/* 元数据信息 */}
                        {activity.metadata && (
                          <div className="flex items-center space-x-2 mt-2">
                            {activity.metadata.platform && (
                              <Badge variant="outline" className="text-xs">
                                {activity.metadata.platform}
                              </Badge>
                            )}
                            {activity.metadata.score && (
                              <Badge variant="secondary" className="text-xs">
                                评分 {activity.metadata.score}
                              </Badge>
                            )}
                            {activity.metadata.searchQuery && (
                              <Badge variant="outline" className="text-xs">
                                &ldquo;{activity.metadata.searchQuery}&rdquo;
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatDistanceToNow(new Date(activity.createdAt), { 
                          addSuffix: true, 
                          locale: zhCN 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length >= 10 && (
              <div className="pt-4 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    // TODO: 导航到完整的活动历史页面
                    console.log('查看更多活动')
                  }}
                >
                  查看更多活动
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}