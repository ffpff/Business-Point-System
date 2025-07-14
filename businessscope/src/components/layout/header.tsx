'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Search, 
  Menu, 
  User, 
  Settings, 
  Bookmark, 
  BarChart3,
  LogOut,
  Home,
  TrendingUp
} from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/opportunities?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/opportunities', label: '商业机会', icon: TrendingUp },
    { href: '/dashboard', label: '仪表板', icon: BarChart3 },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BS</span>
            </div>
            <h1 className="text-xl font-bold hidden sm:block">BusinessScope</h1>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="text-sm font-medium hover:text-primary transition-colors flex items-center space-x-1"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm mx-4 hidden lg:block">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="搜索商业机会..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </form>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => {
              // TODO: Implement mobile search modal
            }}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Authentication */}
          {status === 'loading' ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {session.user?.name && (
                      <p className="font-medium">{session.user.name}</p>
                    )}
                    {session.user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>仪表板</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks" className="flex items-center space-x-2">
                    <Bookmark className="w-4 h-4" />
                    <span>我的收藏</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>个人资料</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>设置</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">注册</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="search"
                      placeholder="搜索商业机会..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full"
                    />
                  </div>
                </form>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}