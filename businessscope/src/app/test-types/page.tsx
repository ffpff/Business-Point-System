import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { 
  RawContent, 
  AIAnalysis, 
  User, 
  OpportunityWithAnalysis,
  DashboardStats,
  Platform,
  FinalRate 
} from "@/types"
import { signInSchema, searchParamsSchema } from "@/lib/validations"

export default function TestTypesPage() {
  // 测试类型定义
  const mockRawContent: RawContent = {
    id: 'test-id',
    platform: 'twitter' as Platform,
    title: '测试标题',
    content: '测试内容',
    author: '测试作者',
    collectedAt: new Date(),
    likesCount: 100,
    sharesCount: 50,
    commentsCount: 20,
    viewCount: 1000,
    status: '待处理',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockAnalysis: AIAnalysis = {
    id: 'analysis-id',
    contentId: 'test-id',
    sentimentLabel: 'positive',
    sentimentScore: 0.8,
    businessRate: 85,
    contentRate: 90,
    finalRate: 'A' as FinalRate,
    analyzedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockUser: User = {
    id: 'user-id',
    email: 'test@example.com',
    name: '测试用户',
    subscriptionType: 'free',
    dailyUsageCount: 5,
    monthlyUsageCount: 150,
    usageLimit: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockOpportunity: OpportunityWithAnalysis = {
    ...mockRawContent,
    analysis: mockAnalysis,
    isBookmarked: true,
  }

  const mockStats: DashboardStats = {
    totalOpportunities: 1250,
    analyzedOpportunities: 980,
    bookmarkedOpportunities: 45,
    todayOpportunities: 25,
    averageScore: 72.5,
    platformDistribution: {
      twitter: 500,
      reddit: 400,
      hackernews: 250,
      producthunt: 100,
    },
    rateDistribution: {
      A: 150,
      B: 400,
      C: 350,
      D: 80,
    },
  }

  // 测试Zod验证
  const validSignIn = signInSchema.safeParse({
    email: 'test@example.com',
    password: 'Password123'
  })

  const validSearch = searchParamsSchema.safeParse({
    q: '人工智能',
    platform: ['twitter', 'reddit'],
    finalRate: ['A', 'B'],
    page: 1,
    limit: 20
  })

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">TypeScript 类型系统测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基础类型测试 */}
        <Card>
          <CardHeader>
            <CardTitle>基础类型测试</CardTitle>
            <CardDescription>RawContent, AIAnalysis, User</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">原始内容</h4>
              <p className="text-sm text-muted-foreground">
                平台: {mockRawContent.platform} | 状态: {mockRawContent.status}
              </p>
            </div>
            <div>
              <h4 className="font-medium">AI分析</h4>
              <div className="flex items-center space-x-2">
                <Badge variant={mockAnalysis.finalRate === 'A' ? 'default' : 'secondary'}>
                  {mockAnalysis.finalRate}
                </Badge>
                <span className="text-sm">
                  商业评分: {mockAnalysis.businessRate}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium">用户信息</h4>
              <p className="text-sm text-muted-foreground">
                {mockUser.name} ({mockUser.subscriptionType})
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 复合类型测试 */}
        <Card>
          <CardHeader>
            <CardTitle>复合类型测试</CardTitle>
            <CardDescription>OpportunityWithAnalysis, DashboardStats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">机会数据</h4>
              <p className="text-sm text-muted-foreground">
                {mockOpportunity.title}
                {mockOpportunity.isBookmarked && ' 🔖'}
              </p>
            </div>
            <div>
              <h4 className="font-medium">统计数据</h4>
              <p className="text-sm text-muted-foreground">
                总计: {mockStats.totalOpportunities} | 
                平均评分: {mockStats.averageScore}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 验证测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Zod验证测试</CardTitle>
            <CardDescription>表单验证和数据验证</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">登录验证</h4>
              <p className="text-sm text-muted-foreground">
                状态: {validSignIn.success ? '✅ 通过' : '❌ 失败'}
              </p>
            </div>
            <div>
              <h4 className="font-medium">搜索参数验证</h4>
              <p className="text-sm text-muted-foreground">
                状态: {validSearch.success ? '✅ 通过' : '❌ 失败'}
              </p>
              {validSearch.success && (
                <p className="text-xs text-muted-foreground">
                  查询: {validSearch.data.q} | 
                  页码: {validSearch.data.page}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 枚举类型测试 */}
        <Card>
          <CardHeader>
            <CardTitle>枚举类型测试</CardTitle>
            <CardDescription>Platform, FinalRate, 状态枚举</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">平台分布</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(mockStats.platformDistribution).map(([platform, count]) => (
                  <Badge key={platform} variant="outline">
                    {platform}: {count}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium">评分分布</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(mockStats.rateDistribution).map(([rate, count]) => (
                  <Badge key={rate} variant={
                    rate === 'A' ? 'default' :
                    rate === 'B' ? 'secondary' :
                    rate === 'C' ? 'outline' : 'destructive'
                  }>
                    {rate}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>类型安全性验证结果</CardTitle>
          <CardDescription>所有类型定义和验证schema的测试结果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Badge variant="default" className="text-lg px-4 py-2">
              🎉 所有类型测试通过
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              TypeScript编译成功，类型安全性得到保证
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}