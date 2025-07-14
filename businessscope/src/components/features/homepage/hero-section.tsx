'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, TrendingUp, Zap, Target, Globe } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function HeroSection() {
  const { data: session } = useSession()

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 opacity-40" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
      
      <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          {/* 标题区域 */}
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              <Zap className="w-4 h-4 mr-2" />
              AI 驱动的商业洞察
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              发现隐藏的
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                商业机会
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              通过AI分析Twitter、Reddit、HackerNews等平台的内容，为您筛选出最有价值的商业机会和趋势洞察。
            </p>
          </div>

          {/* CTA按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {session ? (
              <Link href="/opportunities">
                <Button size="lg" className="px-8 py-3 text-lg font-medium">
                  开始探索机会
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/signin">
                <Button size="lg" className="px-8 py-3 text-lg font-medium">
                  立即开始
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/opportunities">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-medium">
                查看示例
              </Button>
            </Link>
          </div>

          {/* 特色数据 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1000+</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">每日分析内容</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">95%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">准确率</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4+</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">主流平台</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}