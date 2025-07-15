import { Metadata } from 'next'
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AppLayout } from '@/components/layout/app-layout'
import { StatsOverview } from '@/components/features/dashboard/stats-overview'
import { RecentActivity } from '@/components/features/dashboard/recent-activity'
import { UsageChart } from '@/components/features/dashboard/usage-chart'
import { BookmarksList } from '@/components/features/dashboard/bookmarks-list'
import { LoadingSkeleton } from '@/components/features/opportunities/loading-skeleton'

export const metadata: Metadata = {
  title: '仪表板 - BusinessScope',
  description: '查看您的商业机会仪表板和使用统计',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/signin')
  }

  return (
    <AppLayout showSidebar={false}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            欢迎回来，{session.user?.name || session.user?.email?.split('@')[0]}！
          </h1>
          <p className="text-muted-foreground mt-2">
            查看您的商业机会仪表板，了解使用情况和发现趋势
          </p>
        </div>

        {/* 统计概览 */}
        <Suspense fallback={<LoadingSkeleton />}>
          <StatsOverview userId={session.user.id} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 使用图表 */}
          <Suspense fallback={<LoadingSkeleton />}>
            <UsageChart userId={session.user.id} />
          </Suspense>

          {/* 最近活动 */}
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentActivity userId={session.user.id} />
          </Suspense>
        </div>

        {/* 我的收藏 */}
        <Suspense fallback={<LoadingSkeleton />}>
          <BookmarksList userId={session.user.id} />
        </Suspense>
      </div>
    </AppLayout>
  )
}