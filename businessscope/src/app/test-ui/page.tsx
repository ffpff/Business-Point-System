import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function TestUIPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">shadcn/ui 组件测试</h1>
      
      {/* 按钮测试 */}
      <Card>
        <CardHeader>
          <CardTitle>按钮组件</CardTitle>
          <CardDescription>测试不同样式的按钮</CardDescription>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button>默认按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="destructive">危险按钮</Button>
        </CardContent>
      </Card>

      {/* 表单测试 */}
      <Card>
        <CardHeader>
          <CardTitle>表单组件</CardTitle>
          <CardDescription>输入框和标签</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" placeholder="输入您的邮箱" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" type="text" placeholder="输入您的姓名" />
          </div>
        </CardContent>
      </Card>

      {/* 徽章和头像测试 */}
      <Card>
        <CardHeader>
          <CardTitle>其他组件</CardTitle>
          <CardDescription>徽章和头像组件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder.jpg" alt="头像" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="space-x-2">
              <Badge>默认</Badge>
              <Badge variant="secondary">次要</Badge>
              <Badge variant="outline">轮廓</Badge>
              <Badge variant="destructive">危险</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}