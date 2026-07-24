import EmailEditor from '@/components/email-editor/EmailEditor'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Since this is a server component handling dynamic params
export default async function TemplateEditorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id
  
  // In a real app, we would fetch the template from Supabase using ID
  // const { data } = await supabase.from('email_templates').select('*').eq('id', id).single()

  // For MVP demonstration:
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/templates" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại Mẫu Email
        </Link>
        <h2 className="text-xl font-bold">Chỉnh sửa Mẫu {id !== 'new' ? id : ''}</h2>
      </div>

      <div className="flex-1">
        <EmailEditor 
          initialContent="" 
          onSave={(html, json) => {
            console.log("Saving HTML:", html)
            // Here we would call a server action or API to save to Supabase
            alert("Đã lưu thiết kế mẫu thành công!")
          }} 
        />
      </div>
    </div>
  )
}
