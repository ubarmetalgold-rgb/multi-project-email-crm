import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProject } from './actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewProjectPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/projects" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Tạo dự án mới</CardTitle>
          <CardDescription>
            Một dự án thường đại diện cho một thương hiệu, website hoặc doanh nghiệp cụ thể.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên dự án</Label>
              <Input id="name" name="name" placeholder="Ví dụ: Cửa hàng ABC" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Định danh URL)</Label>
              <Input id="slug" name="slug" placeholder="cua-hang-abc" required pattern="^[a-z0-9-]+$" title="Chỉ chứa chữ thường, số và dấu gạch ngang" />
              <p className="text-xs text-slate-500">Chỉ dùng chữ thường, số và dấu gạch ngang.</p>
            </div>

            <Button type="submit" className="w-full">
              Tạo dự án
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
