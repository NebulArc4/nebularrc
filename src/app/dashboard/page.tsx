import { getSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TaskSubmissionForm from '@/components/TaskSubmissionForm'
import TaskList from '@/components/TaskList'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardStats from '@/components/DashboardStats'
import DashboardSidebar from '@/components/DashboardSidebar'
import ModelPerformanceDashboard from '@/components/ModelPerformanceDashboard'
import AgentManager from '@/components/AgentManager'

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  const user = session.user

  // Get profile data with error handling
  let profile = null
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single()
    profile = profileData
  } catch (error) {
    console.log('Profile not found, using default values')
  }

  // Get task statistics with error handling
  let taskStats = {
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  }

  try {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('user_id', user.id)

    taskStats = {
      total: tasks?.length || 0,
      pending: tasks?.filter(t => t.status === 'pending').length || 0,
      completed: tasks?.filter(t => t.status === 'completed').length || 0,
      inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    }
  } catch (error) {
    console.log('Error fetching tasks:', error)
  }

  // Get user's display name
  const displayName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* RunPod Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]"></div>
        
        {/* RunPod signature gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Top left */}
          <div className="absolute top-0 left-0 w-[800px] h-[600px] bg-gradient-to-br from-[#6366f1]/10 via-[#8b5cf6]/5 to-transparent rounded-full blur-3xl"></div>
          
          {/* Top right */}
          <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-[#3b82f6]/10 via-[#6366f1]/5 to-transparent rounded-full blur-3xl"></div>
          
          {/* Bottom left */}
          <div className="absolute bottom-0 left-0 w-[700px] h-[400px] bg-gradient-to-tr from-[#8b5cf6]/10 via-[#a855f7]/5 to-transparent rounded-full blur-3xl"></div>
          
          {/* Bottom right */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-tl from-[#3b82f6]/10 via-[#1d4ed8]/5 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating dots */}
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-[#6366f1] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-3/4 left-1/3 w-0.5 h-0.5 bg-[#3b82f6] rounded-full animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse" style={{animationDelay: '5s'}}></div>
        <div className="absolute top-2/3 left-1/4 w-0.5 h-0.5 bg-[#6366f1] rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader user={user} profile={profile} />
        
        <div className="flex">
          <DashboardSidebar />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-gray-400 text-base">
                  Ready to tackle your next AI-powered task?
                </p>
                {profile?.role && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {profile.role}
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <DashboardStats stats={taskStats} />

              {/* Main Content Grid - Task Submission and Task List */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Task Submission */}
                <div className="lg:col-span-1">
                  <TaskSubmissionForm user={user} />
                </div>

                {/* Task List */}
                <div className="lg:col-span-2">
                  <TaskList userId={user.id} />
                </div>
              </div>

              {/* AI Agents Section */}
              <div className="mb-8">
                <AgentManager />
              </div>

              {/* Model Performance Dashboard */}
              <div className="mb-8">
                <ModelPerformanceDashboard />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
