import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard',
    default: 'My Dashboard',
  },
  robots: { index: false, follow: false },
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * Dashboard layout — auth guard only.
 * Verifies the user is authenticated; individual pages fetch their own data.
 * Role-specific redirects (e.g. super_admin → /admin) are handled in the page.
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  return <>{children}</>
}
