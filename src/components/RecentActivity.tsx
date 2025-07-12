'use client'

import { useRouter } from 'next/navigation'

interface RecentActivityProps {
  userId: string
  limit?: number
}

export default function RecentActivity({ }: RecentActivityProps) {
  const router = useRouter()

  // Mock data for recent activity since we removed tasks
  const recentActivity = [
    {
      id: '1',
      type: 'agent_run',
      title: 'Data Analysis Agent',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      description: 'Analyzed user productivity patterns'
    },
        {
      id: '2',
      type: 'system',
      title: 'System Update',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      description: 'AI models updated to latest version'
    },
    {
      id: '3',
      type: 'agent_run',
      title: 'Financial Analysis',
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      description: 'Generated investment recommendations'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10'
      case 'in_progress':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'pending':
        return 'text-blue-400 bg-blue-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }



  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent_run':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'system':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
    <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <div className="text-sm text-gray-400">{recentActivity.length} activities</div>
      </div>
      
      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-[#2a2a2a] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No recent activity</p>
          <p className="text-gray-500 text-xs mt-1">Start by running an AI agent</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < recentActivity.length - 1 && (
                <div className="absolute left-6 top-8 w-0.5 h-8 bg-[#333]"></div>
              )}
              
              <div className="flex items-start space-x-3">
                {/* Status indicator */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                  {getTypeIcon(activity.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(activity.created_at)}</span>
                  </div>
                  
                  <p className="text-sm text-white mb-1">
                    {activity.title}
                  </p>
                  
                  <div className="text-xs text-gray-400">
                    {truncateText(activity.description, 40)}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {recentActivity.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#333]">
          <button className="w-full text-center text-sm text-[#6366f1] hover:text-[#8b5cf6] transition-colors" onClick={() => router.push('/dashboard/activity')}>
            View all activity
          </button>
        </div>
      )}
    </div>
  )
} 