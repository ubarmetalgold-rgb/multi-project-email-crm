import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, FileEdit, Trash2, Mail } from 'lucide-react'

export default async function TemplatesPage() {
  // TODO: Fetch templates from Supabase
  const templates: { id: string, name: string, subject: string, updated_at: string }[] = []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mẫu Email (Templates)</h2>
          <p className="text-slate-500">Quản lý và thiết kế các mẫu email cho chiến dịch của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Link href="/templates/new">
              <Plus className="w-4 h-4 mr-2" />
              Tạo mẫu mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm mẫu email..."
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <Mail className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Chưa có mẫu email nào</h3>
            <p className="text-slate-500 mt-1 mb-4">Hãy tạo một mẫu email mới để bắt đầu gửi chiến dịch.</p>
            <Button>
              <Link href="/templates/new">Tạo mẫu ngay</Link>
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="overflow-hidden flex flex-col">
              <div className="h-40 bg-slate-100 dark:bg-slate-800 border-b flex items-center justify-center text-slate-400">
                <Mail className="h-10 w-10 opacity-20" />
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base line-clamp-1" title={template.name}>
                  {template.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 line-clamp-2 mb-4" title={template.subject}>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Chủ đề:</span> {template.subject}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-400">Sửa lần cuối: {template.updated_at}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                      <Link href={`/templates/${template.id}/edit`}>
                        <FileEdit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
