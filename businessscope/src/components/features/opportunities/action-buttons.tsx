'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck, Share2, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useBookmark } from '@/hooks/use-api'
import type { OpportunityWithAnalysis } from '@/lib/api'

interface ActionButtonsProps {
  opportunity: OpportunityWithAnalysis & { isBookmarked?: boolean }
  onBookmarkChange?: (isBookmarked: boolean) => void
}

export function ActionButtons({ opportunity, onBookmarkChange }: ActionButtonsProps) {
  const [shareLoading, setShareLoading] = useState(false)
  const { data: session } = useSession()
  const { toggleBookmark, isBookmarked, loading: bookmarkLoading } = useBookmark()

  const handleBookmark = async () => {
    if (!session) {
      toast.error('请先登录后再收藏')
      return
    }

    const currentStatus = opportunity.isBookmarked || isBookmarked(opportunity.id)
    const action = currentStatus ? 'unbookmark' : 'bookmark'
    
    const success = await toggleBookmark(opportunity.id, action)
    
    if (success) {
      const newBookmarkStatus = !currentStatus
      onBookmarkChange?.(newBookmarkStatus)
      
      toast.success(newBookmarkStatus ? '收藏成功' : '已取消收藏', {
        icon: newBookmarkStatus ? <CheckCircle className="w-4 h-4" /> : undefined
      })
    } else {
      toast.error(action === 'bookmark' ? '收藏失败' : '取消收藏失败')
    }
  }

  const handleShare = async () => {
    try {
      setShareLoading(true)
      
      const shareData = {
        title: opportunity.title || '商业机会分享',
        text: `发现一个有趣的商业机会：${opportunity.title || '无标题'}`,
        url: window.location.href
      }

      // 检查是否支持原生分享API
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        toast.success('分享成功')
      } else {
        // 降级到复制链接
        await navigator.clipboard.writeText(window.location.href)
        toast.success('链接已复制到剪贴板', {
          icon: <Copy className="w-4 h-4" />
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share error:', error)
        // 如果分享失败，尝试复制链接作为备选方案
        try {
          await navigator.clipboard.writeText(window.location.href)
          toast.success('链接已复制到剪贴板')
        } catch {
          toast.error('分享失败')
        }
      }
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('链接已复制到剪贴板', {
        icon: <Copy className="w-4 h-4" />
      })
    } catch (error) {
      console.error('Copy error:', error)
      toast.error('复制失败')
    }
  }

  const handleCopyContent = async () => {
    try {
      const content = [
        opportunity.title && `标题：${opportunity.title}`,
        opportunity.author && `作者：${opportunity.author}`,
        opportunity.content && `内容：${opportunity.content}`,
        opportunity.originalUrl && `原文链接：${opportunity.originalUrl}`,
        `详情页面：${window.location.href}`
      ].filter(Boolean).join('\n\n')

      await navigator.clipboard.writeText(content)
      toast.success('内容已复制到剪贴板', {
        icon: <Copy className="w-4 h-4" />
      })
    } catch (error) {
      console.error('Copy content error:', error)
      toast.error('复制失败')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 主要操作 */}
          <div className="flex gap-2 flex-1">
            <Button
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              variant={(opportunity.isBookmarked || isBookmarked(opportunity.id)) ? "default" : "outline"}
              className="flex-1 sm:flex-none"
            >
              {bookmarkLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (opportunity.isBookmarked || isBookmarked(opportunity.id)) ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span className="ml-2">
                {(opportunity.isBookmarked || isBookmarked(opportunity.id)) ? '已收藏' : '收藏'}
              </span>
            </Button>

            <Button
              onClick={handleShare}
              disabled={shareLoading}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {shareLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span className="ml-2">分享</span>
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden sm:block" />
          <Separator className="sm:hidden" />

          {/* 辅助操作 */}
          <div className="flex gap-2 flex-1 sm:flex-none">
            <Button
              onClick={handleCopyLink}
              variant="ghost"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Copy className="w-4 h-4 mr-2" />
              复制链接
            </Button>

            <Button
              onClick={handleCopyContent}
              variant="ghost"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Copy className="w-4 h-4 mr-2" />
              复制内容
            </Button>
          </div>
        </div>

        {/* 提示信息 */}
        {!session && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                登录后可以收藏机会，方便后续查看
              </span>
            </div>
          </div>
        )}

        {/* 快捷操作说明 */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 提示：可以使用 Ctrl+D (Windows) 或 Cmd+D (Mac) 收藏到浏览器书签</p>
        </div>
      </CardContent>
    </Card>
  )
}