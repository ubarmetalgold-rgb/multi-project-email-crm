import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function UnsubscribeSuccessPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md text-center border-none shadow-lg">
        <CardHeader className="pb-2">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Đã Hủy Đăng Ký</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">
            Bạn đã hủy đăng ký nhận email thành công. Chúng tôi sẽ không gửi thêm email nào tới địa chỉ của bạn nữa.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
