import { getSupabaseServer } from '@/lib/supabase-server'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardSidebar from '@/components/DashboardSidebar'
import RecentActivity from '@/components/RecentActivity'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Session Error</h1>
          <p className="text-red-400">No user session found. Please <a href="/auth" className="underline text-blue-400">log in</a> again.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
      </div>
      <div className="relative z-10">
        <DashboardHeader user={user} profile={{}} />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Full Activity Feed</h1>
              <RecentActivity userId={user.id} limit={1000} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 