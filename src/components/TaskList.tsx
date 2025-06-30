'use client'

import { useEffect, useState } from 'react'

interface Task {
  id: string
  task_prompt: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  result?: string
  error_message?: string
  created_at: string
  updated_at?: string
  category?: string
  complexity?: 'low' | 'medium' | 'high'
  model_used?: string
  tokens_used?: number
}

export default function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    
    // Set up polling for task updates
    const interval = setInterval(() => {
      setRefreshing(true)
      fetchTasks()
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [userId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'low':
        return 'text-emerald-400'
      case 'medium':
        return 'text-amber-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const renderMarkdown = (text: string): string => {
    if (!text) return ''
    
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 text-gray-300">$2</li>')
      
      // Tables
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(cell => cell.trim())
        if (cells.length > 1) {
          const cellHtml = cells.map(cell => `<td class="px-3 py-2 border border-gray-600 text-gray-300">${cell.trim()}</td>`).join('')
          return `<tr>${cellHtml}</tr>`
        }
        return match
      })
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-gray-600 my-4">')
      
      // Line breaks
      .replace(/\n/g, '<br>')
  }

  if (loading) {
    return (
      <div className="bg-[#1f1f1f] rounded-lg border border-[#333] p-5">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Your AI Tasks</h2>
            <p className="text-gray-400 text-xs">Loading your tasks...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-6">
          <svg className="animate-spin h-6 w-6 text-[#6366f1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-[#1f1f1f] rounded-lg border border-[#333] p-5">
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Your AI Tasks</h2>
            <p className="text-gray-400 text-xs">No tasks submitted yet</p>
          </div>
        </div>
        <div className="text-center py-6">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-300">No tasks yet</h3>
          <p className="mt-1 text-xs text-gray-500">Get started by creating your first AI task.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1f1f1f] rounded-lg border border-[#333] p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Your AI Tasks</h2>
            <p className="text-gray-400 text-xs">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        {refreshing && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Updating...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <div key={task.id} className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-200">
            {/* Task Header */}
            <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'completed' ? 'bg-emerald-400' :
                    task.status === 'in_progress' ? 'bg-blue-400 animate-pulse' :
                    task.status === 'pending' ? 'bg-amber-400' :
                    task.status === 'failed' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    task.status === 'completed' ? 'text-emerald-300' :
                    task.status === 'in_progress' ? 'text-blue-300' :
                    task.status === 'pending' ? 'text-amber-300' :
                    task.status === 'failed' ? 'text-red-300' :
                    'text-gray-300'
                  }`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                  </span>
                  {task.category && (
                    <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 rounded-md">
                      {task.category}
                    </span>
                  )}
                  {task.complexity && (
                    <span className={`px-2 py-1 text-xs bg-gray-700/50 rounded-md ${getComplexityColor(task.complexity)}`}>
                      {task.complexity}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  {task.model_used && (
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>{task.model_used}</span>
                    </span>
                  )}
                  {task.tokens_used && (
                    <span className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{task.tokens_used.toLocaleString()}</span>
                    </span>
                  )}
                  <span>{new Date(task.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Task Content */}
            <div className="p-4">
              {/* Task Prompt */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-blue-300 text-sm font-medium">Task #{tasks.length - idx}</span>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {renderMarkdown(task.task_prompt)}
                  </div>
                </div>
              </div>

              {/* Task Result or Error */}
              {task.result ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-emerald-300 text-sm font-medium">AI Response</span>
                  </div>
                  <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-700/30">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {renderMarkdown(task.result)}
                    </div>
                  </div>
                </div>
              ) : task.error_message ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-300 text-sm font-medium">Execution Failed</span>
                  </div>
                  <div className="bg-red-900/20 rounded-lg p-3 border border-red-700/30">
                    <p className="text-red-200 text-sm">{task.error_message}</p>
                  </div>
                </div>
              ) : task.status === 'in_progress' ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  <span className="ml-2 text-gray-400 text-sm">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-pulse rounded-full h-6 w-6 bg-amber-400/20"></div>
                  <span className="ml-2 text-gray-400 text-sm">Waiting to start...</span>
                </div>
              )}

              {/* Task Metadata */}
              <div className="mt-4 pt-3 border-t border-gray-700/30 flex items-center justify-between text-xs text-gray-500">
                <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                {task.updated_at && task.updated_at !== task.created_at && (
                  <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {tasks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700/30">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {tasks.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {tasks.filter(t => t.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {tasks.filter(t => t.status === 'failed').length}
              </div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
