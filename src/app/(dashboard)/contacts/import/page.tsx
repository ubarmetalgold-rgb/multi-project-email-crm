'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function ImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setStatus('uploading')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // TODO: In a real app, you would select the project id properly.
    // For now, we will assume a default project or prompt user.
    const projectId = '00000000-0000-0000-0000-000000000000' 
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `${projectId}/${fileName}`

    try {
      const { error } = await supabase.storage
        .from('crm-imports')
        .upload(filePath, file)

      if (error) throw error

      setStatus('processing')
      
      // TODO: Call a Server Action or API route to create the import_job and push to pgmq
      // await createImportJobAction({ filePath, projectId })
      
      setStatus('done')
    } catch (err: unknown) {
      setStatus('error')
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Có lỗi xảy ra khi upload file.')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Import Khách Hàng</h2>
        <p className="text-slate-500">Tải lên file CSV hoặc XLSX để nhập danh sách khách hàng vào hệ thống.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tải lên tệp tin</CardTitle>
          <CardDescription>
            Đảm bảo file của bạn có cột Email. Tối đa 10,000 dòng mỗi file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center">
            {status === 'done' ? (
              <div className="space-y-3 text-green-600">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <div className="font-medium">File đã được tải lên thành công!</div>
                <p className="text-sm text-slate-500">Hệ thống đang xử lý dữ liệu ngầm. Bạn có thể rời khỏi trang này.</p>
              </div>
            ) : status === 'error' ? (
              <div className="space-y-3 text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto" />
                <div className="font-medium">Lỗi tải lên</div>
                <p className="text-sm">{errorMessage}</p>
                <Button variant="outline" onClick={() => setStatus('idle')}>Thử lại</Button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                <div className="text-sm font-medium text-slate-900 mb-2">
                  Kéo thả file vào đây hoặc nhấn để chọn
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Chỉ hỗ trợ CSV và XLSX (Tối đa 10MB)
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <Button variant="secondary" onClick={() => document.getElementById('file-upload')?.click()}>
                  Chọn file
                </Button>
                {file && (
                  <div className="mt-4 p-2 bg-slate-100 rounded text-sm font-medium w-full text-left truncate">
                    Đã chọn: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 bg-slate-50">
          <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || status === 'uploading' || status === 'processing' || status === 'done'}
          >
            {status === 'uploading' ? 'Đang tải lên...' : status === 'processing' ? 'Đang xử lý...' : 'Bắt đầu Import'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
