import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: '仪表板 - BusinessScope',
  description: '查看您的商业机会仪表板',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          欢迎回来，{session.user?.name || session.user?.email}！
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              今日查看
            </h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">
              今天查看的商业机会数量
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              收藏总数
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">
              您收藏的商业机会总数
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              使用限额
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {session.user?.dailyUsageCount || 0}/{session.user?.usageLimit || 50}
            </p>
            <p className="text-sm text-gray-500">
              每日使用限额 ({session.user?.subscriptionType || 'free'})
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            快速操作
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/opportunities"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                浏览最新机会
              </Link>
              <Link
                href="/bookmarks"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                查看我的收藏
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500">
            这是一个临时的仪表板页面，用于认证测试。
          </p>
        </div>
      </div>
    </div>
  )
}