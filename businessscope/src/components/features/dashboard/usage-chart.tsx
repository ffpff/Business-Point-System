'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'

interface UsageData {
  daily: Array<{
    date: string
    views: number
    bookmarks: number
    searches: number
  }>
  weekly: Array<{
    week: string
    views: number
    bookmarks: number
    searches: number
  }>
  platformDistribution: Array<{
    platform: string
    count: number
    percentage: number
  }>
}

interface UsageChartProps {
  userId: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function UsageChart({ userId }: UsageChartProps) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('daily')

  useEffect(() => {
    async function fetchUsageData() {
      try {
        const response = await fetch('/api/user/usage-chart')
        if (!response.ok) {
          throw new Error('获取使用图表数据失败')
        }
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || '获取使用图表数据失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [userId])


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span>使用趋势</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-400" />
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
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span>使用趋势</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-red-600">
            <TrendingUp className="h-5 w-5" />
            <span>加载图表数据时出错：{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <span>使用趋势</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>每日</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>每周</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center space-x-1">
              <PieChartIcon className="h-4 w-4" />
              <span>平台</span>
            </TabsTrigger>
          </TabsList>

          {/* 每日使用趋势 */}
          <TabsContent value="daily" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="浏览"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookmarks" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="收藏"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="searches" 
                    stackId="1"
                    stroke="#8B5CF6" 
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                    name="搜索"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>浏览</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>收藏</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span>搜索</span>
              </div>
            </div>
          </TabsContent>

          {/* 每周使用趋势 */}
          <TabsContent value="weekly" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3B82F6" name="浏览" />
                  <Bar dataKey="bookmarks" fill="#10B981" name="收藏" />
                  <Bar dataKey="searches" fill="#8B5CF6" name="搜索" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* 平台分布 */}
          <TabsContent value="platform" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.platformDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ platform, percentage }) => `${platform} ${percentage}%`}
                    >
                      {data.platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">平台偏好</h4>
                {data.platformDistribution.map((item, index) => (
                  <div key={item.platform} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.platform}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">{item.count}</span>
                      <Badge variant="secondary">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}