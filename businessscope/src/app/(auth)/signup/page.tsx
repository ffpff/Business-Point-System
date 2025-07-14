import { Metadata } from 'next'
import { AuthLayout } from '@/components/layout/auth-layout'
import { SignUpForm } from '@/components/features/auth/signup-form'

export const metadata: Metadata = {
  title: '注册 - BusinessScope',
  description: '创建您的 BusinessScope 账户，发现商业机会',
}

export default function SignUpPage() {
  return (
    <AuthLayout
      title="欢迎加入 BusinessScope"
      description="创建账户，开始发现商业机会"
    >
      <SignUpForm />
    </AuthLayout>
  )
}