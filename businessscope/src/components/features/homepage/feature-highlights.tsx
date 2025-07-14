'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Filter, 
  BookmarkCheck, 
  TrendingUp, 
  Search, 
  Timer,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI 智能分析',
    description: '使用先进的AI技术分析内容质量、商业价值和情感倾向，自动评分和分类',
    color: 'blue',
    badge: '核心功能'
  },
  {
    icon: Filter,
    title: '高级筛选',
    description: '多维度筛选功能，支持平台、时间、评分、关键词等多种筛选条件',
    color: 'purple',
    badge: '效率工具'
  },
  {
    icon: BookmarkCheck,
    title: '个性化收藏',
    description: '保存感兴趣的商业机会，建立个人的机会库，随时回顾和跟踪',
    color: 'green',
    badge: '用户功能'
  },
  {
    icon: TrendingUp,
    title: '趋势洞察',
    description: '实时分析热门话题和趋势，帮助您把握市场脉搏和商业机会',
    color: 'orange',
    badge: '数据洞察'
  },
  {
    icon: Search,
    title: '智能搜索',
    description: '支持全文搜索、关键词推荐和搜索历史，快速找到相关内容',
    color: 'cyan',
    badge: '搜索功能'
  },
  {
    icon: Timer,
    title: '实时更新',
    description: '24/7 自动收集和分析最新内容，确保您始终获得最新的商业信息',
    color: 'red',
    badge: '实时数据'
  }
]

const getIconColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900',
    red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900'
  }
  return colorMap[color] || colorMap.blue
}

const getBadgeColor = (color: string) => {
  const colorMap: { [key: string]: string } = {
    blue: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950',
    purple: 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-950',
    green: 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950',
    orange: 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-950',
    cyan: 'border-cyan-200 text-cyan-700 bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:bg-cyan-950',
    red: 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950'
  }
  return colorMap[color] || colorMap.blue
}

export default function FeatureHighlights() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题部分 */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            核心功能
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            为什么选择 BusinessScope？
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            强大的AI分析能力，帮助您从海量信息中发现最有价值的商业机会
          </p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${getIconColor(feature.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className={`text-xs ${getBadgeColor(feature.color)}`}>
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 底部统计信息 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">98%</h3>
              <p className="text-gray-600 dark:text-gray-300">用户满意度</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">24/7</h3>
              <p className="text-gray-600 dark:text-gray-300">实时监控</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">&lt;1s</h3>
              <p className="text-gray-600 dark:text-gray-300">响应速度</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}