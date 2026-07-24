'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Send } from 'lucide-react'

export default function NewCampaignPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSend = async () => {
    setIsSubmitting(true)
    try {
      // TODO: Save to database, push to queue, etc.
      await new Promise(r => setTimeout(r, 1500))
      router.push('/campaigns')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tạo chiến dịch mới</h2>
          <p className="text-slate-500">Cấu hình thông tin gửi email và chọn tệp khách hàng.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chiến dịch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên chiến dịch (Nội bộ)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Black Friday 2026"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên người gửi (Sender Name)</label>
              <input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="VD: Antigravity Team"
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email người gửi (Sender Email)</label>
              <input
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="VD: hello@antigravity.vn"
                type="email"
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề Email (Subject)</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sale khủng ngày thứ 6 đen tối!"
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">Chọn Mẫu Email (Template)</label>
            <select className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
              <option value="">-- Chọn một mẫu email --</option>
              {/* TODO: Options */}
            </select>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">Gửi tới danh sách (Segment)</label>
            <select className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
              <option value="">Tất cả khách hàng</option>
              {/* TODO: Options */}
            </select>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-6 flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button onClick={handleSend} disabled={isSubmitting || !name || !senderEmail || !subject}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Đang chuẩn bị...' : 'Bắt đầu gửi'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
