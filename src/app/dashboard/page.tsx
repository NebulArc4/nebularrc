import { getSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TaskSubmissionForm from '@/components/TaskSubmissionForm'
import TaskList, { Task } from '@/components/TaskList'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardStats from '@/components/DashboardStats'
import DashboardSidebar from '@/components/DashboardSidebar'
import ModelPerformanceDashboard from '@/components/ModelPerformanceDashboard'
import AgentManager from '@/components/AgentManager'
import QuickActions from '@/components/QuickActions'
import RecentActivity from '@/components/RecentActivity'
import AIInsights from '@/components/AIInsights'
import AITaskRecommendations from '@/components/AITaskRecommendations'
import InfoBanner from './InfoBanner'

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth')
  }

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

  let taskStats = {
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  }
  let tasksError = null
  let tasksLoading = true
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
    tasksLoading = false
  } catch (error) {
    tasksError = error
    tasksLoading = false
  }

  let recentTasks: Task[] = []
  try {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, task_prompt, status, created_at, result')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    recentTasks = tasks || []
  } catch (error) {
    //
  }

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
    //
  }

  const displayName = profile?.name || user.email?.split('@')[0] || 'User'

  // Info banner state (client only)
  // Use a simple script to show/hide the banner on the client
  return (
    <div className="max-w-7xl mx-auto py-8 space-y-10">
      {/* Info Banner (client only) */}
      <InfoBanner />
      <DashboardStats stats={taskStats} agentStats={agentStats} />
      <QuickActions user={user} />
      <RecentActivity tasks={recentTasks} />
      <AIInsights user={user} />
    </div>
  )
}
