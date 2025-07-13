import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { OpportunityWithAnalysis } from "@/types"

interface OpportunityCardProps {
  opportunity: OpportunityWithAnalysis
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">
              {opportunity.title || '无标题'}
            </CardTitle>
            <CardDescription>
              {opportunity.platform} • {opportunity.author}
            </CardDescription>
          </div>
          {opportunity.analysis?.finalRate && (
            <Badge variant={
              opportunity.analysis.finalRate === 'A' ? 'default' :
              opportunity.analysis.finalRate === 'B' ? 'secondary' :
              opportunity.analysis.finalRate === 'C' ? 'outline' : 'destructive'
            }>
              {opportunity.analysis.finalRate}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {opportunity.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>👍 {opportunity.likesCount}</span>
            <span>💬 {opportunity.commentsCount}</span>
            <span>👁️ {opportunity.viewCount}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              🔖 收藏
            </Button>
            <Button variant="outline" size="sm">
              查看详情
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}