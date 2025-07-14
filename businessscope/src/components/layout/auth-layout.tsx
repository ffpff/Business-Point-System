import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 返回首页按钮 */}
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>
        </div>

        {/* 标题和描述 */}
        {(title || description) && (
          <div className="text-center space-y-2">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>
        )}

        {/* 表单内容 */}
        <div className="flex justify-center">
          {children}
        </div>

        {/* 底部链接 */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            使用 BusinessScope 即表示您同意我们的{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              服务条款
            </Link>{' '}
            和{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}