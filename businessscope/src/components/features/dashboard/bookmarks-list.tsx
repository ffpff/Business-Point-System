'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bookmark, 
  ArrowRight,
  Eye,
  Trash2,
  Star
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface BookmarkItem {
  id: string
  createdAt: string
  notes?: string
  content: {
    id: string
    title: string
    platform: string
    author?: string
    publishedAt?: string
    analysis?: {
      businessRate?: number
      finalRate?: string
      sentimentLabel?: string
    }
  }
}

interface BookmarksListProps {
  userId: string
}

export function BookmarksList({ userId }: BookmarksListProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const response = await fetch('/api/user/bookmarks?limit=6')
        if (!response.ok) {
          throw new Error('获取收藏列表失败')
        }
        const data = await response.json()
        if (data.success) {
          setBookmarks(data.data.bookmarks || [])
        } else {
          throw new Error(data.error || '获取收藏列表失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarks()
  }, [userId])

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/user/bookmarks/${bookmarkId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
      }
    } catch (err) {
      console.error('删除收藏失败:', err)
    }
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Twitter': 'bg-blue-100 text-blue-800',
      'Reddit': 'bg-orange-100 text-orange-800',
      'HackerNews': 'bg-gray-100 text-gray-800',
      'ProductHunt': 'bg-red-100 text-red-800'
    }
    return colors[platform] || 'bg-gray-100 text-gray-800'
  }

  const getFinalRateColor = (rate?: string) => {
    const colors: Record<string, string> = {
      '优秀': 'bg-green-100 text-green-800',
      '良好': 'bg-blue-100 text-blue-800',
      '一般': 'bg-yellow-100 text-yellow-800',
      '较差': 'bg-red-100 text-red-800'
    }
    return rate ? colors[rate] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
  }

  const getSentimentColor = (sentiment?: string) => {
    const colors: Record<string, string> = {
      '积极': 'bg-green-100 text-green-800',
      '中性': 'bg-gray-100 text-gray-800',
      '消极': 'bg-red-100 text-red-800'
    }
    return sentiment ? colors[sentiment] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Bookmark className="h-5 w-5 text-yellow-600" />
            <span>我的收藏</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
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
            <Bookmark className="h-5 w-5 text-yellow-600" />
            <span>我的收藏</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <Bookmark className="h-5 w-5" />
            <span>加载收藏列表时出错：{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="h-5 w-5 text-yellow-600" />
            <span>我的收藏</span>
          </div>
          {bookmarks.length > 0 && (
            <Badge variant="secondary">{bookmarks.length} 个</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookmarks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>暂无收藏内容</p>
            <p className="text-sm">发现感兴趣的机会时点击收藏吧！</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/opportunities">
                探索机会
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/opportunities/${bookmark.content.id}`}
                      className="block hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 truncate mb-2">
                        {bookmark.content.title || '无标题'}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                      <span>
                        收藏于 {formatDistanceToNow(new Date(bookmark.createdAt), { 
                          addSuffix: true, 
                          locale: zhCN 
                        })}
                      </span>
                      {bookmark.content.author && (
                        <>
                          <span>•</span>
                          <span>作者: {bookmark.content.author}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={getPlatformColor(bookmark.content.platform)}>
                        {bookmark.content.platform}
                      </Badge>
                      
                      {bookmark.content.analysis?.finalRate && (
                        <Badge className={getFinalRateColor(bookmark.content.analysis.finalRate)}>
                          {bookmark.content.analysis.finalRate}
                        </Badge>
                      )}
                      
                      {bookmark.content.analysis?.sentimentLabel && (
                        <Badge className={getSentimentColor(bookmark.content.analysis.sentimentLabel)}>
                          {bookmark.content.analysis.sentimentLabel}
                        </Badge>
                      )}
                      
                      {bookmark.content.analysis?.businessRate && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">
                            {bookmark.content.analysis.businessRate}/5
                          </span>
                        </div>
                      )}
                    </div>

                    {bookmark.notes && (
                      <p className="text-sm text-gray-600 italic">
                        &ldquo;{bookmark.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/opportunities/${bookmark.content.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {bookmarks.length >= 6 && (
              <div className="pt-4 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  asChild
                >
                  <Link href="/bookmarks">
                    查看全部收藏
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}