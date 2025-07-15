'use client'

import { Brain, Target, MessageSquare, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { AIAnalysis } from '@/types'

interface AIAnalysisSectionProps {
  analysis: AIAnalysis
}

const sentimentConfig = {
  '积极': { label: '积极', color: 'bg-green-500', textColor: 'text-green-700' },
  '中性': { label: '中性', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  '消极': { label: '消极', color: 'bg-red-500', textColor: 'text-red-700' }
} as const

const finalRateConfig = {
  '高': { label: '高价值', color: 'bg-green-500', textColor: 'text-green-700', icon: TrendingUp },
  '中': { label: '中等价值', color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: Target },
  '低': { label: '低价值', color: 'bg-gray-500', textColor: 'text-gray-700', icon: AlertCircle }
} as const

export function AIAnalysisSection({ analysis }: AIAnalysisSectionProps) {
  const sentimentInfo = analysis.sentimentLabel 
    ? sentimentConfig[analysis.sentimentLabel as keyof typeof sentimentConfig]
    : null

  const finalRateInfo = analysis.finalRate
    ? finalRateConfig[analysis.finalRate as keyof typeof finalRateConfig]
    : null

  const FinalRateIcon = finalRateInfo?.icon || Target

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI 分析结果
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          分析时间：{formatDistanceToNow(new Date(analysis.analyzedAt), { 
            addSuffix: true, 
            locale: zhCN 
          })}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 综合评级 */}
        {finalRateInfo && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${finalRateInfo.color}`}>
                <FinalRateIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">综合评级</div>
                <div className={`text-sm ${finalRateInfo.textColor}`}>
                  {finalRateInfo.label}
                </div>
              </div>
            </div>
            {analysis.confidence && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">置信度</div>
                <div className="text-lg font-semibold">
                  {((analysis.confidence || 0) * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* 评分详情 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 商业价值评分 */}
          {analysis.businessRate !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium">商业价值</span>
                </div>
                <span className="text-lg font-semibold text-primary">
                  {analysis.businessRate}/10
                </span>
              </div>
              <Progress 
                value={(analysis.businessRate || 0) * 10} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                评估内容的商业机会和市场潜力
              </div>
            </div>
          )}

          {/* 内容质量评分 */}
          {analysis.contentRate !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">内容质量</span>
                </div>
                <span className="text-lg font-semibold text-blue-600">
                  {analysis.contentRate}/10
                </span>
              </div>
              <Progress 
                value={(analysis.contentRate || 0) * 10} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                评估内容的清晰度和信息价值
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* 情感分析 */}
        {(sentimentInfo || analysis.sentimentScore) && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              情感分析
            </h4>
            
            <div className="flex items-center gap-4">
              {sentimentInfo && (
                <Badge className={`${sentimentInfo.color} text-white`}>
                  {sentimentInfo.label}
                </Badge>
              )}
              
              {analysis.sentimentScore !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">情感得分：</span>
                  <span className="font-medium">
                    {((analysis.sentimentScore || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 主要话题 */}
        {analysis.mainTopic && (
          <div className="space-y-2">
            <h4 className="font-medium">主要话题</h4>
            <Badge variant="outline" className="text-sm">
              {analysis.mainTopic}
            </Badge>
          </div>
        )}

        {/* 关键词 */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">关键词</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 分析原因 */}
        {analysis.reason && (
          <div className="space-y-2">
            <h4 className="font-medium">分析说明</h4>
            <div className="bg-muted/50 rounded-lg p-3 text-sm leading-relaxed">
              {analysis.reason}
            </div>
          </div>
        )}

        {/* 分析元信息 */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              分析ID: {analysis.id.slice(0, 8)}...
            </div>
            <div>
              内容ID: {analysis.contentId.slice(0, 8)}...
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}