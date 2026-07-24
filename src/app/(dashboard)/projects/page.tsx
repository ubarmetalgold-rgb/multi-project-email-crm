import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Settings } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  // Fetch user projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, organization_members!inner(organization_id)')
    // Since RLS is enabled, this will only return projects the user has access to
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dự án của bạn</h2>
          <p className="text-slate-500">Quản lý các không gian làm việc và thương hiệu email.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="w-4 h-4 mr-2" />
            Tạo dự án mới
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.length === 0 && (
          <div className="col-span-full p-8 text-center border rounded-lg bg-white dark:bg-slate-900 border-dashed">
            <h3 className="text-lg font-medium mb-2">Chưa có dự án nào</h3>
            <p className="text-slate-500 mb-4">Tạo dự án đầu tiên của bạn để bắt đầu gửi email.</p>
            <Button asChild>
              <Link href="/projects/new">
                Tạo dự án mới
              </Link>
            </Button>
          </div>
        )}
        
        {projects?.map((project: any) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Slug: {project.slug}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="flex items-center justify-between mt-4">
                <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-slate-100 text-slate-800'}`}>
                  {project.status === 'active' ? 'Hoạt động' : 'Đã lưu trữ'}
                </span>
                <div className="flex gap-2">
                  <form action={`/api/projects/select`} method="post">
                    <input type="hidden" name="projectId" value={project.id} />
                    <Button type="submit" variant="default" size="sm">
                      Mở
                    </Button>
                  </form>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/projects/${project.id}/settings`}>
                      <Settings className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
