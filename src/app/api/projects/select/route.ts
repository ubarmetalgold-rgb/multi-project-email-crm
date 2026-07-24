import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const formData = await request.formData()
  const projectId = formData.get('projectId') as string

  if (projectId) {
    const cookieStore = await cookies()
    // Lưu project_id vào cookie
    cookieStore.set('project_id', projectId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  }

  // Chuyển hướng người dùng về trang dashboard hoặc trang họ vừa xem
  redirect('/dashboard')
}
