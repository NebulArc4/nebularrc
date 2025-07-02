'use client'

import { useState, useEffect } from 'react'
import { Agent, AgentRun } from '@/lib/agent-service'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AgentCard from './AgentCard'
import Toast from './Toast'
import Modal from './Modal'

interface AgentTemplate {
  id: string
  name: string
  description: string
  task_prompt: string
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
  category: string
  model: string
  complexity: 'low' | 'medium' | 'high'
}

export default function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([])
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'last_run' | 'complexity'>('name')
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    task_prompt: '',
    schedule: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom',
    custom_schedule: '',
    category: 'other',
    model: 'llama3-8b-8192',
    complexity: 'medium' as 'low' | 'medium' | 'high'
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAgents()
    fetchTemplates()
  }, [])

  // Filter and sort agents based on search query, status filter, category filter, and sort preference
  useEffect(() => {
    let filtered = agents

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.task_prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => {
        if (statusFilter === 'active') return agent.is_active
        if (statusFilter === 'inactive') return !agent.is_active
        return true
      })
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(agent => agent.category === categoryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return (a.is_active ? 0 : 1) - (b.is_active ? 0 : 1)
        case 'last_run':
          const aLastRun = a.last_run ? new Date(a.last_run).getTime() : 0
          const bLastRun = b.last_run ? new Date(b.last_run).getTime() : 0
          return bLastRun - aLastRun
        case 'complexity':
          const complexityOrder = { 'low': 0, 'medium': 1, 'high': 2 }
          return (complexityOrder[a.complexity as keyof typeof complexityOrder] || 3) - (complexityOrder[b.complexity as keyof typeof complexityOrder] || 3)
        default:
          return 0
      }
    })

    setFilteredAgents(filtered)
  }, [agents, searchQuery, statusFilter, categoryFilter, sortBy])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      if (response.ok) {
        const data = await response.json()
        const agentsData = Array.isArray(data) ? data : []
        setAgents(agentsData)
        setFilteredAgents(agentsData)
        setToast({ message: 'Agents fetched successfully', type: 'success' })
      }
    } catch (error) {
      setToast({ message: 'Error fetching agents', type: 'error' })
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/agents/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setSortBy('name')
  }

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          name: '',
          description: '',
          task_prompt: '',
          schedule: 'daily',
          custom_schedule: '',
          category: 'other',
          model: 'llama3-8b-8192',
          complexity: 'medium'
        })
        fetchAgents()
        setToast({ message: 'Agent created successfully', type: 'success' })
      }
    } catch (error) {
      setToast({ message: 'Error creating agent', type: 'error' })
      console.error('Error creating agent:', error)
    }
  }

  const handleToggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, is_active: isActive })
      })

      if (response.ok) {
        fetchAgents()
      }
    } catch (error) {
      console.error('Error toggling agent:', error)
    }
  }

  const handleRunAgent = async (agentId: string) => {
    setRunningAgents(prev => new Set(prev).add(agentId))
    
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      })

      if (response.ok) {
        fetchAgents()
        if (selectedAgent?.id === agentId) {
          fetchAgentRuns(agentId)
        }
        setToast({ message: 'Agent run started', type: 'success' })
      }
    } catch (error) {
      setToast({ message: 'Error running agent', type: 'error' })
      console.error('Error running agent:', error)
    } finally {
      setRunningAgents(prev => {
        const newSet = new Set(prev)
        newSet.delete(agentId)
        return newSet
      })
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      const response = await fetch(`/api/agents?agentId=${agentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAgents()
        if (selectedAgent?.id === agentId) {
          setSelectedAgent(null)
          setAgentRuns([])
        }
      }
    } catch (error) {
      console.error('Error deleting agent:', error)
    }
  }

  const fetchAgentRuns = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/run?agentId=${agentId}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        const sortedRuns = Array.isArray(data) ? data.sort((a: AgentRun, b: AgentRun) => 
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        ) : []
        setAgentRuns(sortedRuns)
        
        // Auto-expand the latest run if there are runs
        if (sortedRuns.length > 0) {
          setExpandedRuns(new Set([sortedRuns[0].id]))
        }
      }
    } catch (error) {
      console.error('Error fetching agent runs:', error)
    }
  }

  const toggleRunExpansion = (runId: string) => {
    setExpandedRuns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(runId)) {
        newSet.delete(runId)
      } else {
        newSet.add(runId)
      }
      return newSet
    })
  }

  // Real-time subscription for agent runs
  useEffect(() => {
    if (!selectedAgent) return

    const channel = supabase.channel('realtime-agent-runs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_runs',
          filter: `agent_id=eq.${selectedAgent.id}`
        },
        (payload) => {
          // On any change, re-fetch agent runs
          fetchAgentRuns(selectedAgent.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedAgent])

  const handleTemplateSelect = (template: AgentTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      task_prompt: template.task_prompt,
      schedule: template.schedule,
      custom_schedule: '',
      category: template.category,
      model: template.model,
      complexity: template.complexity
    })
    setShowTemplates(false)
    setShowCreateForm(true)
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
      case 'running':
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

  const getScheduleIcon = (schedule: string) => {
    switch (schedule) {
      case 'hourly':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'daily':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'weekly':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'monthly':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
    }
  }

  const renderMarkdown = (text: string): string => {
    if (!text) return ''
    
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">$1</h1>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">$1</a>')
      
      // Lists - wrap in ul/ol tags
      .replace(/^(\*|-|\d+\.) (.*$)/gim, (match, bullet, content) => {
        if (bullet.match(/\d+/)) {
          return `<li class="ml-4 text-gray-700 dark:text-gray-300 list-decimal">${content}</li>`
        } else {
          return `<li class="ml-4 text-gray-700 dark:text-gray-300 list-disc">${content}</li>`
        }
      })
      
      // Tables - simple table handling
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(cell => cell.trim())
        if (cells.length > 1) {
          const cellHtml = cells.map(cell => `<td class="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">${cell.trim()}</td>`).join('')
          return `<tr>${cellHtml}</tr>`
        }
        return match
      })
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-gray-300 dark:border-gray-600 my-4">')
      
      // Line breaks
      .replace(/\n/g, '<br>')
  }

  function parseAgentRunResult(result: string) {
    try {
      return JSON.parse(result)
    } catch {
      return { content: result }
    }
  }

  const getRunPreview = (run: AgentRun): string => {
    const result = parseAgentRunResult(run.result || '')
    const content = result.content || result.text || result.message || run.result || ''
    return content.length > 100 ? content.substring(0, 100) + '...' : content
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-gray-200/40 dark:bg-gray-700/40 rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div className="bg-gray-50 dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-[#333] p-6">
      {/* Search and Filter Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Agents</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchAgents()}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Refresh agents"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => setShowTemplates(true)}
              className="px-3 py-2 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors text-sm"
            >
              Templates
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-2 bg-blue-600 dark:bg-[#6366f1] text-white rounded-lg hover:bg-blue-700 dark:hover:bg-[#5b5beb] transition-colors text-sm"
            >
              Create Agent
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search agents by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#23233a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-gray-100 dark:focus:bg-[#23233a]"
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="data-analysis">Data Analysis</option>
            <option value="content-generation">Content Generation</option>
            <option value="automation">Automation</option>
            <option value="monitoring">Monitoring</option>
            <option value="other">Other</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'status' | 'last_run' | 'complexity')}
            className="px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="last_run">Sort by Last Run</option>
            <option value="complexity">Sort by Complexity</option>
          </select>

          {/* Results Count */}
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            {filteredAgents.length} of {agents.length} agents
          </div>
        </div>
      </div>

      {/* Agent List */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No agents found' : 'No agents yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters' 
              : 'Create your first agent to get started'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleActive={handleToggleAgent}
              onRun={handleRunAgent}
            />
          ))}
        </div>
      )}

      {/* Create Agent Form Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Agent">
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Prompt</label>
            <textarea
              value={formData.task_prompt}
              onChange={(e) => setFormData({ ...formData, task_prompt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule</label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="data-analysis">Data Analysis</option>
                <option value="content-generation">Content Generation</option>
                <option value="automation">Automation</option>
                <option value="monitoring">Monitoring</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 dark:bg-[#6366f1] text-white rounded-lg hover:bg-blue-700 dark:hover:bg-[#5b5beb] transition-colors"
            >
              Create Agent
            </button>
          </div>
        </form>
      </Modal>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 border border-gray-200 dark:border-[#444] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{template.category}</span>
                    <span>•</span>
                    <span>{template.complexity}</span>
                    <span>•</span>
                    <span>{template.schedule}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
} 