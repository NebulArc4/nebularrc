'use client'

interface Task {
  id: string
  task_prompt: string
  status: string
  created_at: string
  result?: string
}

interface RecentActivityProps {
  tasks: Task[]
}

export default function RecentActivity({ tasks }: RecentActivityProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10'
      case 'in_progress':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10'
      case 'pending':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-400/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'in_progress':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white/80 dark:bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">{tasks.length} tasks</div>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">No recent activity</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Start by creating your first task</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id} className="relative">
              {/* Timeline line */}
              {index < tasks.length - 1 && (
                <div className="absolute left-6 top-8 w-0.5 h-8 bg-gray-300 dark:bg-[#333]"></div>
              )}
              
              <div className="flex items-start space-x-3">
                {/* Status indicator */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(task.created_at)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-900 dark:text-white mb-1">
                    {truncateText(task.task_prompt)}
                  </p>
                  
                  {task.result && task.status === 'completed' && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Result: {truncateText(task.result, 30)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-[#333]">
          <button className="w-full text-center text-sm text-[#6366f1] hover:text-[#8b5cf6] transition-colors">
            View all activity
          </button>
        </div>
      )}
    </div>
  )
} 