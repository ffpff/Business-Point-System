'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter } from 'lucide-react'
import { Sidebar } from './sidebar'

interface MobileSidebarProps {
  children?: React.ReactNode
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="mb-4">
            <Filter className="w-4 h-4 mr-2" />
            筛选器
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[350px] p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>筛选条件</span>
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar className="w-full border-0" />
          </div>
        </SheetContent>
      </Sheet>
      {children}
    </div>
  )
}