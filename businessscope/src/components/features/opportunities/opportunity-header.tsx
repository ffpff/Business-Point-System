'use client'

import { ExternalLink, Calendar, Eye, Heart, MessageCircle, Share2, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { RawContent, AIAnalysis } from '@/types'

interface OpportunityHeaderProps {
  opportunity: RawContent & { 
    analysis?: AIAnalysis | null
    isBookmarked?: boolean 
  }
}

const platformConfig = {
  'Reddit': { 
    label: 'Reddit', 
    color: 'bg-orange-500', 
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50'
  },
  'Twitter': { 
    label: 'Twitter', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50'
  },
  'LinkedIn': { 
    label: 'LinkedIn', 
    color: 'bg-blue-600', 
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50'
  },
  'YouTube': { 
    label: 'YouTube', 
    color: 'bg-red-500', 
    textColor: 'text-red-700',
    bgColor: 'bg-red-50'
  }
} as const

const statusConfig = {
  '已分析': { label: '已分析', variant: 'default' as const },
  '待处理': { label: '待处理', variant: 'secondary' as const },
  '处理中': { label: '处理中', variant: 'outline' as const },
  '分析失败': { label: '分析失败', variant: 'destructive' as const }
}

export function OpportunityHeader({ opportunity }: OpportunityHeaderProps) {
  const platform = opportunity.platform as keyof typeof platformConfig
  const platformInfo = platformConfig[platform] || {
    label: opportunity.platform,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50'
  }

  const statusInfo = statusConfig[opportunity.status as keyof typeof statusConfig] || {
    label: opportunity.status,
    variant: 'outline' as const
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* 平台标识和状态 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge 
              className={`${platformInfo.color} text-white hover:${platformInfo.color}/90`}
            >
              {platformInfo.label}
            </Badge>
            <Badge variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {opportunity.publishedAt ? (
              <span>
                发布于 {formatDistanceToNow(new Date(opportunity.publishedAt), { 
                  addSuffix: true, 
                  locale: zhCN 
                })}
              </span>
            ) : (
              <span>
                收集于 {formatDistanceToNow(new Date(opportunity.collectedAt), { 
                  addSuffix: true, 
                  locale: zhCN 
                })}
              </span>
            )}
          </div>
        </div>

        {/* 标题 */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold leading-tight mb-2">
            {opportunity.title || '无标题内容'}
          </h1>
          
          {opportunity.author && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>作者：{opportunity.author}</span>
            </div>
          )}
        </div>

        {/* 内容预览 */}
        {opportunity.content && (
          <div className="mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {opportunity.content.length > 500 
                  ? `${opportunity.content.slice(0, 500)}...` 
                  : opportunity.content
                }
              </div>
            </div>
          </div>
        )}

        {/* 标签 */}
        {opportunity.tags && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.split(',').map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* 互动数据和原文链接 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(opportunity.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{formatNumber(opportunity.likesCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{formatNumber(opportunity.commentsCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span>{formatNumber(opportunity.sharesCount)}</span>
            </div>
          </div>

          {opportunity.originalUrl && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(opportunity.originalUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查看原文
            </Button>
          )}
        </div>

        {/* AI分析概览 */}
        {opportunity.analysis && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {opportunity.analysis.businessRate !== null && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {opportunity.analysis.businessRate}
                  </div>
                  <div className="text-xs text-muted-foreground">商业价值</div>
                </div>
              )}
              {opportunity.analysis.contentRate !== null && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {opportunity.analysis.contentRate}
                  </div>
                  <div className="text-xs text-muted-foreground">内容质量</div>
                </div>
              )}
              {opportunity.analysis.sentimentScore !== null && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {((opportunity.analysis.sentimentScore || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">情感得分</div>
                </div>
              )}
              {opportunity.analysis.confidence !== null && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {((opportunity.analysis.confidence || 0) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">置信度</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}