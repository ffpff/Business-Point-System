import { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { SignInForm } from '@/components/features/auth/signin-form'

export const metadata: Metadata = {
  title: '登录 - BusinessScope',
  description: '登录您的 BusinessScope 账户',
}

function SignInContent() {
  return (
    <AuthLayout
      title="欢迎回来"
      description="登录您的账户，继续探索商业机会"
    >
      <SignInForm />
    </AuthLayout>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SignInContent />
    </Suspense>
  )
}