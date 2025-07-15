'use client'

import { Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { OpportunitiesList } from '@/components/features/opportunities/opportunities-list'
import { LoadingSkeleton } from '@/components/features/opportunities/loading-skeleton'

export default function OpportunitiesPage() {
  return (
    <AppLayout showSidebar={true}>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">商业机会</h1>
          <p className="text-muted-foreground mt-2">
            发现来自各大平台的商业机会，通过AI分析找到最有价值的内容
          </p>
        </div>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <OpportunitiesList />
        </Suspense>
      </div>
    </AppLayout>
  )
}