import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: '忘记密码 - BusinessScope',
  description: '重置您的 BusinessScope 账户密码',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/signin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回登录
            </Link>
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">忘记密码</CardTitle>
            <CardDescription>
              此功能正在开发中，敬请期待
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                密码重置功能将在后续版本中提供。
              </p>
              <p className="text-sm text-gray-500">
                如需帮助，请联系管理员。
              </p>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/signin">
                  返回登录
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">
                  创建新账户
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}