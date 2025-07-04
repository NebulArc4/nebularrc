'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import StockPriceChart, { searchSymbolByCompanyName } from './StockPriceChart'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import AIOutputRenderer from './AIOutputRenderer'

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

// Helper hook to extract stock symbol or company name and resolve to symbol
function useResolvedSymbol(text: string): string | null {
  const [resolvedSymbol, setResolvedSymbol] = useState<string | null>(null)
  useEffect(() => {
    // Try regex for symbol first
    const match = text.match(/\b[A-Z]{1,5}\b/g)
    const blacklist = ['THE', 'AND', 'FOR', 'WITH', 'FROM', 'THIS', 'THAT', 'YOUR', 'HAVE', 'WILL', 'SHOULD', 'COULD', 'MIGHT', 'ABOUT', 'WHICH', 'THERE', 'THEIR', 'WHAT', 'WHEN', 'WHERE', 'WHO', 'WHY', 'HOW']
    const symbol = match?.find(s => !blacklist.includes(s)) || null
    if (symbol) {
      setResolvedSymbol(symbol)
      return
    }
    // If no symbol, look for company name if context is investment
    const investmentKeywords = ['invest', 'investment', 'stock', 'buy', 'sell', 'portfolio', 'shares', 'market', 'equity', 'ipo', 'dividend']
    const lower = text.toLowerCase()
    if (investmentKeywords.some(k => lower.includes(k))) {
      // Try to find a capitalized word (company name)
      const nameMatch = text.match(/\b([A-Z][a-z]+)\b/)
      if (nameMatch) {
        searchSymbolByCompanyName(nameMatch[1]).then(sym => {
          if (sym) setResolvedSymbol(sym)
        })
      }
    }
  }, [text])
  return resolvedSymbol
}

export default function TaskList({ userId }: { userId: string }) {
  const { data: tasks = [], error, isLoading, mutate } = useSWR('/api/tasks')
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'complexity'>('date')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (error) toast.error('Error fetching tasks')
  }, [error])

  // Filter and sort tasks based on search query, status filter, and sort preference
  useEffect(() => {
    let filtered = tasks
    if (searchQuery.trim()) {
      filtered = filtered.filter((task: Task) =>
        task.task_prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.result && task.result.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task: Task) => task.status === statusFilter)
    }
    filtered.sort((a: Task, b: Task) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'status':
          const statusOrder = { 'in_progress': 0, 'pending': 1, 'completed': 2, 'failed': 3 }
          return (statusOrder[a.status as keyof typeof statusOrder] || 4) - (statusOrder[b.status as keyof typeof statusOrder] || 4)
        case 'complexity':
          const complexityOrder = { 'low': 0, 'medium': 1, 'high': 2 }
          return (complexityOrder[a.complexity as keyof typeof complexityOrder] || 3) - (complexityOrder[b.complexity as keyof typeof complexityOrder] || 3)
        default:
          return 0
      }
    })
    setFilteredTasks(filtered)
  }, [tasks, searchQuery, statusFilter, sortBy])

  // Real-time updates (keep as is, but call mutate on change)
  useEffect(() => {
    const channel = supabase.channel('realtime-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        () => {
          mutate()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, mutate])

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('date')
  }

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
      
      // Lists - wrap in ul/ol tags
      .replace(/^(\*|-|\d+\.) (.*$)/gim, (match, bullet, content) => {
        if (bullet.match(/\d+/)) {
          return `<li class="ml-4 text-gray-300 list-decimal">${content}</li>`
        } else {
          return `<li class="ml-4 text-gray-300 list-disc">${content}</li>`
        }
      })
      
      // Tables - simple table handling
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

  // Add helper to check overdue/urgent
  const isOverdue = (task: Task) => task.status !== 'completed' && new Date(task.created_at) < new Date()
  const isUrgent = (task: Task) => task.status === 'pending' && new Date(task.created_at) < new Date(Date.now() - 24*60*60*1000)

  // Add delete handler
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
      mutate((prev: Task[] | undefined) => prev ? prev.filter((t: Task) => t.id !== taskId) : [], false)
    } catch (err) {
      alert('Failed to delete task')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] p-6">
      {/* Search and Filter Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => mutate()}
              disabled={isLoading}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Refresh tasks"
            >
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks by prompt, result, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'complexity')}
            className="px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="complexity">Sort by Complexity</option>
          </select>

          {/* Results Count */}
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first task to get started'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-gray-50 dark:bg-[#2a2a2a] rounded-lg border border-gray-200 dark:border-[#444] overflow-hidden ${isOverdue(task) ? 'border-red-500' : isUrgent(task) ? 'border-yellow-500' : ''}`}
            >
              {/* Task Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition-colors group flex items-center justify-between"
                onClick={() => toggleTaskExpansion(task.id)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.task_prompt}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.complexity && (
                        <span className={`text-xs ${getComplexityColor(task.complexity)}`}>
                          {task.complexity} complexity
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Delete button, only visible on hover */}
                <button
                  className="ml-2 p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-opacity opacity-0 group-hover:opacity-100"
                  title="Delete task"
                  onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedTasks.has(task.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Task Details (Expanded) */}
              {expandedTasks.has(task.id) && (
                <div className="border-t border-gray-200 dark:border-[#444] p-4 bg-white dark:bg-[#1f1f1f]">
                  <div className="space-y-4">
                    {/* Task Prompt */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Task Prompt</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded border">
                        {task.task_prompt}
                      </p>
                    </div>

                    {/* Task Result */}
                    {task.result && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Result</h4>
                        <AIOutputRenderer text={task.result} />
                      </div>
                    )}

                    {/* Error Message */}
                    {task.error_message && (
                      <div>
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Error</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded border">
                          {task.error_message}
                        </p>
                      </div>
                    )}

                    {/* Task Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-[#444]">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                      </div>
                      {task.updated_at && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(task.updated_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {task.model_used && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Model</p>
                          <p className="text-sm text-gray-900 dark:text-white">{task.model_used}</p>
                        </div>
                      )}
                      {task.tokens_used && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Tokens</p>
                          <p className="text-sm text-gray-900 dark:text-white">{task.tokens_used.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Category and Complexity Tags */}
                    {task.category && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold mr-2">{task.category}</span>
                      </div>
                    )}
                    {task.complexity && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Complexity</p>
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold mr-2">{task.complexity}</span>
                      </div>
                    )}

                    {/* Overdue and Urgent Tags */}
                    {isOverdue(task) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold mr-2">Overdue</span>
                      </div>
                    )}
                    {isUrgent(task) && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold mr-2">Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
