import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Send, Clock, PlayCircle } from 'lucide-react'

export default async function CampaignsPage() {
  // TODO: Fetch campaigns from Supabase
  const campaigns: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chiến dịch (Campaigns)</h2>
          <p className="text-slate-500">Quản lý và theo dõi hiệu suất các chiến dịch gửi email của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              Tạo chiến dịch mới
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách chiến dịch</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm chiến dịch..."
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
                  <TableHead>Tên chiến dịch</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mở (%)</TableHead>
                  <TableHead>Click (%)</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                      Chưa có chiến dịch nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium">
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell>--</TableCell>
                      <TableCell>--</TableCell>
                      <TableCell>{c.started_at || 'Chưa gửi'}</TableCell>
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
