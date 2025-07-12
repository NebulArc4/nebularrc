'use client'

import { useState, useEffect } from 'react'
import { Agent, AgentRun } from '@/lib/agent-service'
import useSWR from 'swr'
import toast from 'react-hot-toast'

export default function AgentManager() {
  const { data: agents = [], isLoading, mutate } = useSWR('/api/agents')
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([])
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'last_run' | 'complexity'>('name')

  useEffect(() => {
    let filtered = agents

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((agent: Agent) =>
        (agent.name && typeof agent.name === 'string' && agent.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agent.description && typeof agent.description === 'string' && agent.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agent.task_prompt && typeof agent.task_prompt === 'string' && agent.task_prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (agent.category && typeof agent.category === 'string' && agent.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((agent: Agent) => {
        if (statusFilter === 'active') return agent.is_active
        if (statusFilter === 'inactive') return !agent.is_active
        return true
      })
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((agent: Agent) => agent.category === categoryFilter)
    }

    // Apply sorting
    filtered.sort((a: Agent, b: Agent) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
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

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setSortBy('name')
  }

  const handleToggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      await mutate(async (prev: Agent[] | undefined) => {
        if (!prev) return prev
        const updated = prev.map(agent => agent.id === agentId ? { ...agent, is_active: isActive } : agent)
        const response = await fetch('/api/agents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, is_active: isActive })
        })
        if (!response.ok) throw new Error('Failed to update agent')
        toast.success('Agent status updated')
        return updated
      }, false)
    } catch {
      toast.error('Error toggling agent')
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
        mutate()
        if (selectedAgent?.id === agentId) {
          fetchAgentRuns(agentId)
        }
        toast.success('Agent run started')
      } else {
        toast.error('Failed to run agent')
      }
    } catch {
      toast.error('Error running agent')
    } finally {
      setRunningAgents(prev => {
        const newSet = new Set(prev)
        newSet.delete(agentId)
        return newSet
      })
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
      }
    } catch {
      toast.error('Error fetching agent runs')
    }
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

  function AgentRunWithChart({ run, getStatusColor }: { run: AgentRun, getStatusColor: (s: string) => string }) {
    return (
      <div className="bg-white dark:bg-[#1f1f1f] rounded-lg p-3 border border-gray-200 dark:border-[#333] mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>{run.status}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(run.started_at).toLocaleDateString()}</span>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter UI */}
      <div className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="data-analysis">Data Analysis</option>
              <option value="content-generation">Content Generation</option>
              <option value="automation">Automation</option>
              <option value="monitoring">Monitoring</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'status' | 'last_run' | 'complexity')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="last_run">Sort by Last Run</option>
              <option value="complexity">Sort by Complexity</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No agents found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new agent.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white dark:bg-[#1f1f1f] rounded-xl border border-gray-200 dark:border-[#333] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Agent Header */}
              <div className="p-6 border-b border-gray-200 dark:border-[#333]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${agent.is_active ? 'bg-green-100 dark:bg-green-500/10' : 'bg-gray-100 dark:bg-gray-600'}`}>
                      <svg className={`w-6 h-6 ${agent.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{agent.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.is_active ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {agent.description}
                </p>
              </div>

              {/* Agent Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Runs</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{agent.total_runs || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Complexity</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{agent.complexity}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs rounded-full">
                    {agent.model}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                    {agent.schedule}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleAgent(agent.id, !agent.is_active)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      agent.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20'
                    }`}
                  >
                    {agent.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <button
                    onClick={() => handleRunAgent(agent.id)}
                    disabled={runningAgents.has(agent.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg transition-colors"
                  >
                    {runningAgents.has(agent.id) ? 'Running...' : 'Run'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    {selectedAgent?.id === agent.id ? 'Hide' : 'View'} Logs
                  </button>
                </div>
              </div>

              {/* Expandable Run History */}
              {selectedAgent?.id === agent.id && (
                <div className="border-t border-gray-200 dark:border-[#333] p-6 bg-gray-50 dark:bg-[#2a2a2a]">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Runs</h4>
                  {agentRuns.length > 0 ? (
                    <div className="space-y-3">
                      {agentRuns.slice(0, 3).map((run) => (
                        <AgentRunWithChart key={run.id} run={run} getStatusColor={getStatusColor} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent runs</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 