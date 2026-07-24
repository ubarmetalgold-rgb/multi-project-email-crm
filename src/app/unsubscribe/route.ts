import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token || !email) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  // TODO: Verify HMAC token to prevent abuse
  // const expectedToken = crypto.createHmac('sha256', process.env.UNSUBSCRIBE_SECRET!).update(email).digest('hex')
  // if (token !== expectedToken) return new NextResponse('Invalid token', { status: 403 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context
          }
        },
      },
    }
  )

  // 1. Update contact global status
  // Note: Unsubscribing globally in this CRM or per project depends on business logic.
  // We'll update the global_status for the contact.
  const { error } = await supabase
    .from('contacts')
    .update({ global_status: 'unsubscribed' })
    .eq('normalized_email', email.toLowerCase())

  if (error) {
    console.error('Unsubscribe error:', error)
    return new NextResponse('Error processing unsubscription', { status: 500 })
  }

  // Redirect to success page
  return NextResponse.redirect(new URL('/unsubscribe/success', request.url))
}
