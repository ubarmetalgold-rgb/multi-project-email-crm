'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Code, Eye } from 'lucide-react'

export default function NewTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('<h1>Hello {{full_name}}!</h1>\n<p>Welcome to our newsletter.</p>')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Call server action to save template to Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      router.push('/templates')
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tạo mẫu email mới</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Đang lưu...' : 'Lưu mẫu'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Tên mẫu</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Newsletter Tháng 8"
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Chủ đề Email</label>
                <input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Chào mừng bạn đến với {{project_name}}"
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Biến có thể dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                <li><code>{`{{email}}`}</code> - Email người nhận</li>
                <li><code>{`{{first_name}}`}</code> - Tên người nhận</li>
                <li><code>{`{{last_name}}`}</code> - Họ người nhận</li>
                <li><code>{`{{full_name}}`}</code> - Họ và tên</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-md">
                Tính năng kéo thả (Drag & Drop) sẽ được tích hợp trong tương lai sử dụng React Email Editor (Unlayer). Hiện tại, bạn có thể thiết kế bằng mã HTML.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="border-b flex items-center bg-slate-50 dark:bg-slate-900 rounded-t-xl px-2 py-2">
              <Button 
                variant={activeTab === 'editor' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('editor')}
                className="text-xs"
              >
                <Code className="h-3 w-3 mr-2" />
                HTML Editor
              </Button>
              <Button 
                variant={activeTab === 'preview' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('preview')}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-2" />
                Xem trước
              </Button>
            </div>
            <CardContent className="p-0 flex-1 min-h-[500px]">
              {activeTab === 'editor' ? (
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full h-full min-h-[500px] p-4 font-mono text-sm resize-none focus:outline-none"
                  placeholder="Nhập mã HTML của bạn vào đây..."
                />
              ) : (
                <div 
                  className="w-full h-full min-h-[500px] bg-white p-8 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
