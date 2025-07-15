'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Eye, Bookmark, ExternalLink, Clock, Tag } from "lucide-react"
import type { Prisma } from '@prisma/client'
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

type OpportunityWithAnalysis = Prisma.RawContentGetPayload<{
  include: { analysis: true }
}>

interface OpportunityCardProps {
  opportunity: OpportunityWithAnalysis
  showPlatformBadge?: boolean
  compact?: boolean
}

const platformConfig = {
  twitter: { name: 'Twitter', color: 'bg-blue-500 text-white', icon: '🐦' },
  reddit: { name: 'Reddit', color: 'bg-orange-500 text-white', icon: '🔴' },
  hackernews: { name: 'HackerNews', color: 'bg-orange-600 text-white', icon: '🔶' },
  producthunt: { name: 'ProductHunt', color: 'bg-red-500 text-white', icon: '🚀' }
}

const getRatingColor = (rate: string) => {
  switch (rate) {
    case 'A': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300'
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300'
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function OpportunityCard({ opportunity, showPlatformBadge = true, compact = false }: OpportunityCardProps) {
  const platformInfo = platformConfig[opportunity.platform as keyof typeof platformConfig] || platformConfig.twitter
  const publishedTime = opportunity.publishedAt || opportunity.createdAt
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group hover:scale-[1.02] border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {showPlatformBadge && (
                <Badge className={`${platformInfo.color} text-xs px-2 py-1`}>
                  {platformInfo.icon} {platformInfo.name}
                </Badge>
              )}
              {opportunity.analysis?.finalRate && (
                <Badge variant="outline" className={`${getRatingColor(opportunity.analysis.finalRate)} text-xs px-2 py-1`}>
                  {opportunity.analysis.finalRate} 级
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {opportunity.title || '无标题'}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="font-medium">{opportunity.author}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(publishedTime, { addSuffix: true, locale: zhCN })}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className={`text-sm text-muted-foreground leading-relaxed mb-4 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {compact && opportunity.content && opportunity.content.length > 100 
            ? `${opportunity.content.slice(0, 100)}...` 
            : opportunity.content
          }
        </p>
        
        {/* AI分析信息 */}
        {opportunity.analysis && !compact && (
          <div className="mb-4">
            {opportunity.analysis.mainTopic && (
              <div className="flex items-center gap-1 mb-2">
                <Tag className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">主题：{opportunity.analysis.mainTopic}</span>
              </div>
            )}
            {opportunity.analysis.businessRate && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">商业价值：</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-20">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${opportunity.analysis.businessRate}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{opportunity.analysis.businessRate}%</span>
              </div>
            )}
          </div>
        )}
        
        {/* 互动数据和操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {opportunity.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {opportunity.commentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {opportunity.viewCount}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {!compact && (
              <Button variant="ghost" size="sm" className="h-8 px-3">
                <Bookmark className="w-3 h-3 mr-1" />
                收藏
              </Button>
            )}
            <Link href={`/opportunities/${opportunity.id}`}>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <ExternalLink className="w-3 h-3 mr-1" />
                详情
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}