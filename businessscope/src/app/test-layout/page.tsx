import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestLayoutPage() {
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
              <ul className="space-y-2 text-sm">
                <li>✅ 响应式导航菜单</li>
                <li>✅ 搜索框（桌面端）</li>
                <li>✅ 用户头像和下拉菜单</li>
                <li>✅ 移动端汉堡菜单</li>
                <li>✅ 登录/注册按钮</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebar组件</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ 平台筛选器</li>
                <li>✅ AI评分筛选</li>
                <li>✅ 情感倾向筛选</li>
                <li>✅ 评分滑块</li>
                <li>✅ 时间范围选择</li>
                <li>✅ 分析状态筛选</li>
                <li>✅ 筛选条件摘要</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>响应式设计</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ 桌面端：侧边栏固定显示</li>
                <li>✅ 移动端：Sheet弹出侧边栏</li>
                <li>✅ 搜索框响应式适配</li>
                <li>✅ 导航菜单响应式</li>
                <li>✅ 容器边距和间距</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">功能测试</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Header测试</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  测试搜索功能
                </Button>
                <Button variant="outline" className="w-full">
                  测试用户菜单
                </Button>
                <Button variant="outline" className="w-full">
                  测试移动端菜单
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sidebar测试</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  测试平台筛选
                </Button>
                <Button variant="outline" className="w-full">
                  测试评分筛选
                </Button>
                <Button variant="outline" className="w-full">
                  测试重置功能
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">测试说明</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. 在桌面端（≥1024px）：侧边栏应该固定显示在左侧</p>
            <p>2. 在移动端（&lt;1024px）：侧边栏应该隐藏，通过"筛选器"按钮打开</p>
            <p>3. Header在所有设备上都应该显示完整功能</p>
            <p>4. 搜索框在大屏幕显示，小屏幕通过搜索图标打开</p>
            <p>5. 用户认证状态会影响Header右侧显示内容</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}