'use client'

import { useAuth } from './AuthProvider'
import DashboardSidebar from './DashboardSidebar'
import PageFade from './PageFade'
import { usePathname } from 'next/navigation'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Don't show sidebar on auth page or public pages
  const isPublicPage = pathname === '/auth' || pathname === '/' || pathname.startsWith('/about') || pathname.startsWith('/features') || pathname.startsWith('/pricing') || pathname.startsWith('/help') || pathname.startsWith('/roadmap') || pathname.startsWith('/integrations')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6366f1]"></div>
      </div>
    )
  }

  if (isPublicPage || !user) {
    return <PageFade>{children}</PageFade>
  }

  return (
    <div className="flex">
      <DashboardSidebar />
      <PageFade>{children}</PageFade>
    </div>
  )
} 