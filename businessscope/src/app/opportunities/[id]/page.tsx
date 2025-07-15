import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { AppLayout } from '@/components/layout/app-layout'
import { LoadingSkeleton } from '@/components/features/opportunities/loading-skeleton'
import { OpportunityDetailContent } from '@/components/features/opportunities/opportunity-detail-content'

interface OpportunityDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: OpportunityDetailPageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `商业机会详情 - ${id}`,
    description: '查看详细的AI分析结果和商业机会评估',
  }
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { id } = await params

  // 验证ID格式
  if (!id || id.length < 10) {
    notFound()
  }

  return (
    <AppLayout showSidebar={false}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Suspense fallback={<LoadingSkeleton />}>
          <OpportunityDetailContent id={id} />
        </Suspense>
      </div>
    </AppLayout>
  )
}