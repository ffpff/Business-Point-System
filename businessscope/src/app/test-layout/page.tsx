import { Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function TestLayoutContent() {
  return (
    <AppLayout showSidebar={true}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">布局组件测试页面</h1>
          <p className="text-muted-foreground mt-2">
            这个页面用于测试Header、Sidebar和AppLayout组件的功能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Header组件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ✅ 响应式导航栏
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 用户认证状态
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 搜索功能
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 移动端适配
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebar组件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ✅ 多维度筛选
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ URL参数同步
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 响应式设计
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 筛选条件重置
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AppLayout组件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ✅ 统一布局管理
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 条件渲染侧边栏
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 响应式适配
                </p>
                <p className="text-sm text-muted-foreground">
                  ✅ 内容区域布局
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">交互测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>搜索功能测试</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    测试搜索框
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    尝试在Header中使用搜索功能
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>筛选器测试</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    测试筛选器
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    尝试使用左侧筛选器功能
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">测试说明</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. 在桌面端（≥1024px）：侧边栏应该固定显示在左侧</p>
            <p>2. 在移动端（&lt;1024px）：侧边栏应该隐藏，通过&quot;筛选器&quot;按钮打开</p>
            <p>3. Header在所有设备上都应该显示完整功能</p>
            <p>4. 搜索框在大屏幕显示，小屏幕通过搜索图标打开</p>
            <p>5. 用户认证状态会影响Header右侧显示内容</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default function TestLayoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestLayoutContent />
    </Suspense>
  )
}