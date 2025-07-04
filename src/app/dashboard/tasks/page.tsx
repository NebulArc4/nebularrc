import { getSupabaseServer } from '@/lib/supabase-server'
import TaskSubmissionForm from '@/components/TaskSubmissionForm'
import TaskList from '@/components/TaskList'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardSidebar from '@/components/DashboardSidebar'
import RecentActivity from '@/components/RecentActivity'
import AIInsights from '@/components/AIInsights'
import TasksPageClient from '@/components/TasksPageClient'
import { useSearchParams } from 'next/navigation'
import StockPriceChart from '@/components/StockPriceChart'

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

// Helper to extract stock symbol from text
function extractStockSymbol(text: string): string | null {
  const match = text.match(/\b[A-Z]{1,5}\b/g);
  if (!match) return null;
  const blacklist = ['THE', 'AND', 'FOR', 'WITH', 'FROM', 'THIS', 'THAT', 'YOUR', 'HAVE', 'WILL', 'SHOULD', 'COULD', 'MIGHT', 'ABOUT', 'WHICH', 'THERE', 'THEIR', 'WHAT', 'WHEN', 'WHERE', 'WHO', 'WHY', 'HOW'];
  const symbol = match.find(s => !blacklist.includes(s));
  return symbol || null;
}

export default async function TasksPage() {
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

  // Get task statistics with error handling
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

  // Get recent tasks for activity feed
  let recentTasks: Array<{
    id: string
    task_prompt: string
    status: string
    created_at: string
    result?: string
  }> = []
  try {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, task_prompt, status, created_at, result')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    recentTasks = tasks || []
  } catch (error) {
    console.error('Error fetching recent tasks:', error)
  }

  // Get overdue/urgent tasks
  const now = new Date()
  const overdueTasks = recentTasks.filter(t => t.status !== 'completed' && new Date(t.created_at) < now)
  const urgentTasks = recentTasks.filter(t => t.status === 'pending' && new Date(t.created_at) < new Date(now.getTime() - 24*60*60*1000))

  // Calculate completion progress
  const completionPercent = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0

  // Add this to get the ?create=1 param
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const autoFocusForm = searchParams?.get('create') === '1';

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
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 flex flex-col space-y-10">
                {/* Stats Cards */}
                {tasksLoading ? (
                  <div className="mb-8 text-blue-600 dark:text-blue-400">Loading tasks...</div>
                ) : tasksError ? (
                  <div className="mb-8 text-red-600 dark:text-red-400">Error loading tasks.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-[#1f1f1f] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-sm flex flex-col items-center">
                      <div className="p-2 bg-blue-100 dark:bg-[#6366f1]/10 rounded-lg mb-2">
                        <svg className="w-6 h-6 text-blue-600 dark:text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1f1f1f] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-sm flex flex-col items-center">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-500/10 rounded-lg mb-2">
                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.pending}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1f1f1f] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-sm flex flex-col items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg mb-2">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.inProgress}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1f1f1f] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-sm flex flex-col items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg mb-2">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.completed}</p>
                    </div>
                  </div>
                )}
                {/* Task Submission Form */}
                <section className="bg-white dark:bg-[#18181b] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-sm">
                  <h2 className="text-2xl font-semibold mb-4">Create a New Task</h2>
                  <TaskSubmissionForm user={user} autoFocus={autoFocusForm} />
                </section>
                {/* Task List */}
                <section className="bg-white dark:bg-[#18181b] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-sm">
                  <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
                  <TaskList userId={user.id} />
                </section>
              </div>
              {/* Sidebar */}
              <aside className="space-y-10">
                <section className="bg-white dark:bg-[#18181b] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Task Timeline</h2>
                  <ul className="space-y-3">
                    {recentTasks.map(task => (
                      <li key={task.id} className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-400' : task.status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
                        <span className="truncate">{task.task_prompt}</span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(task.created_at).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="bg-white dark:bg-[#18181b] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                  <RecentActivity userId={user.id} limit={5} />
                </section>
                <section className="bg-white dark:bg-[#18181b] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
                  <AIInsights user={user} />
                </section>
              </aside>
            </div>
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Stock Price Explorer</h2>
              {/* For each task result, auto-detect stock symbol and show chart if found */}
              {recentTasks.map(task => {
                const symbol = extractStockSymbol(task.result || '');
                if (!symbol) return null;
                return (
                  <div key={task.id} className="mt-8">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Stock Price Chart for {symbol}</h3>
                    <StockPriceChart symbol={symbol} />
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Client-side components for modals */}
      <TasksPageClient />
    </div>
  )
} 