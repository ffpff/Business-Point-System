import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-gray-50/50">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">筛选器</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">平台</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="twitter" />
                  <label htmlFor="twitter" className="text-sm">Twitter</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="reddit" />
                  <label htmlFor="reddit" className="text-sm">Reddit</label>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">评分</h4>
              <div className="flex space-x-1">
                <Badge variant="outline">A</Badge>
                <Badge variant="outline">B</Badge>
                <Badge variant="outline">C</Badge>
                <Badge variant="outline">D</Badge>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              重置筛选
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}