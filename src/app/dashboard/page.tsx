import { getSupabaseServer } from '@/lib/supabase-server'
// import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardStats from '@/components/DashboardStats'
import DashboardSidebar from '@/components/DashboardSidebar'
import AIInsights from '@/components/AIInsights'

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = getSupabaseServer()

  // Use getUser() for secure authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Should never happen due to middleware, but handle gracefully
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Session Error</h1>
          <p className="text-red-400">No user session found. Please <a href="/auth" className="underline text-blue-400">log in</a> again.</p>
        </div>
      </div>
    )
  }

  // Get profile data with error handling
  let profile = null
  let profileError = null
  let profileLoading = true
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single()
    profile = profileData
    profileLoading = false
  } catch (error) {
    profileError = error
    profileLoading = false
  }



  // Get agent statistics
  let agentStats = {
    total: 0,
    active: 0,
    totalRuns: 0,
  }
  try {
    const { data: agents } = await supabase
      .from('agents')
      .select('is_active, total_runs')
      .eq('user_id', user.id)
    agentStats = {
      total: agents?.length || 0,
      active: agents?.filter(a => a.is_active).length || 0,
      totalRuns: agents?.reduce((sum, a) => sum + (a.total_runs || 0), 0) || 0,
    }
  } catch (error) {
    console.error('Error fetching agent stats:', error)
  }

  // Get user's display name
  const displayName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
        
        {/* Enhanced RunPod signature gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Top left */}
          <div className="absolute top-0 left-0 w-[800px] h-[600px] bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent dark:from-[#6366f1]/10 dark:via-[#8b5cf6]/5 dark:to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
          
          {/* Top right */}
          <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-blue-400/10 via-indigo-500/5 to-transparent dark:from-[#3b82f6]/10 dark:via-[#6366f1]/5 dark:to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s'}}></div>
          
          {/* Bottom left */}
          <div className="absolute bottom-0 left-0 w-[700px] h-[400px] bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent dark:from-[#8b5cf6]/10 dark:via-[#a855f7]/5 dark:to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '12s'}}></div>
          
          {/* Bottom right */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-tl from-blue-400/10 via-blue-600/5 to-transparent dark:from-[#3b82f6]/10 dark:via-[#1d4ed8]/5 dark:to-transparent rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s'}}></div>
        </div>
        
        {/* Enhanced grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-blue-500 dark:bg-[#6366f1] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-1/3 w-0.5 h-0.5 bg-blue-400 dark:bg-[#3b82f6] rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-500 dark:bg-[#8b5cf6] rounded-full animate-pulse" style={{animationDelay: '5s'}}></div>
        <div className="absolute top-2/3 left-1/4 w-0.5 h-0.5 bg-indigo-500 dark:bg-[#6366f1] rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-blue-400 dark:bg-[#3b82f6] rounded-full animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-3/5 right-1/5 w-0.5 h-0.5 bg-purple-400 dark:bg-[#8b5cf6] rounded-full animate-pulse" style={{animationDelay: '6s'}}></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader user={user} profile={profile || {}} />
        
        <div className="flex">
          <DashboardSidebar />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Enhanced Welcome Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Welcome back, {displayName}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Ready to run your next AI-powered analysis?
                    </p>
                  </div>
                  <div className="hidden lg:flex items-center space-x-4">

                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active Agents</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{agentStats.active}</p>
                    </div>
                  </div>
                </div>
                
                {profileLoading && (
                  <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">Loading profile...</div>
                )}
                {profileError && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">Error loading profile.</div>
                )}
                {profile?.role && !profileLoading && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-[#6366f1]/10 dark:text-[#6366f1] border border-blue-200 dark:border-[#6366f1]/20">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {profile.role}
                  </div>
                )}
              </div>

              {/* Enhanced Stats Cards */}
              <div className="mb-8">
                <DashboardStats agentStats={agentStats} />
              </div>

              {/* AI Insights Section */}
              <div className="mb-8">
                <AIInsights user={user} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
