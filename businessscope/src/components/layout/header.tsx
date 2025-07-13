import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">BusinessScope</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <span className="text-sm font-medium hover:text-primary cursor-pointer">
            首页
          </span>
          <span className="text-sm font-medium hover:text-primary cursor-pointer">
            商业机会
          </span>
          <span className="text-sm font-medium hover:text-primary cursor-pointer">
            仪表板
          </span>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            登录
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}