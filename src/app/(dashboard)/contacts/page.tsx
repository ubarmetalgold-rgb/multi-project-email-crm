import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UploadCloud, Plus, Search } from 'lucide-react'

export default async function ContactsPage() {
  const cookieStore = await cookies()
  const projectId = cookieStore.get('project_id')?.value
  const supabase = await createClient()

  let contacts: any[] = []

  if (projectId) {
    const { data } = await supabase
      .from('contact_project_memberships')
      .select(`
        status,
        joined_at,
        contacts!inner (
          id,
          normalized_email,
          full_name
        )
      `)
      .eq('project_id', projectId)
      .order('joined_at', { ascending: false })
      .limit(50)
      
    if (data) {
      contacts = data.map(item => {
        const c: any = Array.isArray(item.contacts) ? item.contacts[0] : item.contacts;
        return {
          id: c?.id,
          email: c?.normalized_email,
          full_name: c?.full_name,
          status: item.status,
          joined_at: new Date(item.joined_at).toLocaleDateString('vi-VN')
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Khách hàng</h2>
          <p className="text-slate-500">Quản lý danh sách khách hàng trong dự án hiện tại.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Link href="/contacts/import">
              <UploadCloud className="w-4 h-4 mr-2" />
              Import CSV
            </Link>
          </Button>
          <Button>
            <Link href="/contacts/new">
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tất cả khách hàng</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm email hoặc tên..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                      Chưa có khách hàng nào. Hãy import hoặc tạo mới để bắt đầu.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.email}</TableCell>
                      <TableCell>{c.full_name}</TableCell>
                      <TableCell>{c.status}</TableCell>
                      <TableCell>{c.joined_at}</TableCell>
                      <TableCell className="text-right">...</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
