import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, Mail, Settings, Tags, LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const projectId = cookieStore.get('project_id')?.value
  const supabase = await createClient()

  let projectName = 'Chưa chọn dự án'
  if (projectId) {
    const { data } = await supabase.from('projects').select('name').eq('id', projectId).single()
    if (data) projectName = data.name
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-lg font-bold">MultiProject CRM</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50 font-medium text-sm">
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan
          </Link>
          <Link href="/projects" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
            <Settings className="w-4 h-4" />
            Dự án
          </Link>
          <Link href="/contacts" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
            <Users className="w-4 h-4" />
            Khách hàng
          </Link>
          <Link href="/campaigns" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
            <Mail className="w-4 h-4" />
            Chiến dịch
          </Link>
          <Link href="/segments" className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-medium text-sm transition-colors">
            <Tags className="w-4 h-4" />
            Phân khúc
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50">
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center">
            <div className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium bg-slate-50 dark:bg-slate-800 flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="text-slate-500">Dự án:</span> 
              <span>{projectName}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
