// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard' // fallback

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  // Exchange the code for a session and get the user
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const user = data.user

  // Check if the user already has a profile in your 'users' table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  // If no profile exists, treat them as new → onboarding
  if (profileError || !profile) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // Returning user → main feed
  return NextResponse.redirect(`${origin}/home`)
}