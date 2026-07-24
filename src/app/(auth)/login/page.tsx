import { login, signup } from './actions'
import { Button } from '@/components/ui/button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;
  
  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-2 text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nhập email của bạn vào bên dưới để truy cập tài khoản
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-500 mt-2 text-center">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <Button formAction={login} className="w-full">
              Đăng nhập
            </Button>
            <Button formAction={signup} variant="outline" className="w-full">
              Đăng ký tài khoản mới
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
