import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('Middleware: Processing request for:', req.nextUrl.pathname)
  
  // Allow public access to cron endpoint
  if (req.nextUrl.pathname.startsWith('/api/cron/')) {
    console.log('Middleware: Allowing public access to cron endpoint')
    return NextResponse.next()
  }
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  console.log('Middleware: Getting session...')
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('Middleware: Session result:', session ? 'exists' : 'null')

  // If no session and trying to access protected routes, redirect to auth
  if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/onboarding'))) {
    console.log('Middleware: No session, redirecting to auth')
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  console.log('Middleware: Allowing request to proceed')
  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/onboarding/:path*',
    '/api/cron/:path*' // 🔓 Allow cron endpoints to be processed by middleware
  ],
}
