'use client'

import { useState, useEffect } from 'react'
import { Agent, AgentRun } from '@/lib/agent-service'

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
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([])
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    task_prompt: '',
    schedule: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom',
    custom_schedule: '',
    category: 'other',
    model: 'mock-ai-v1',
    complexity: 'medium' as 'low' | 'medium' | 'high'
  })

  useEffect(() => {
    fetchAgents()
    fetchTemplates()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      if (response.ok) {
        const data = await response.json()
        setAgents(Array.isArray(data) ? data : [])
      }
    } catch (error) {
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
          model: 'mock-ai-v1',
          complexity: 'medium'
        })
        fetchAgents()
      }
    } catch (error) {
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
      }
    } catch (error) {
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
        setAgentRuns(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching agent runs:', error)
    }
  }

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
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'running': return 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20'
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getScheduleIcon = (schedule: string) => {
    switch (schedule) {
      case 'hourly': return '🕐'
      case 'daily': return '📅'
      case 'weekly': return '📆'
      case 'monthly': return '🗓️'
      default: return '⚙️'
    }
  }

  if (loading) {
    return (
      <div className="bg-[#1f1f1f] rounded-lg border border-[#333] p-6">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-[#6366f1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1f1f1f] rounded-lg border border-[#333] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Agents</h2>
            <p className="text-gray-400 text-xs">24/7 automated task execution</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1.5 text-sm bg-[#6366f1]/20 hover:bg-[#6366f1]/30 text-[#6366f1] rounded-lg transition-colors"
          >
            Templates
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-3 py-1.5 text-sm bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#8b5cf6] rounded-lg transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create Agent'}
          </button>
        </div>
      </div>

      {/* Agent Templates */}
      {showTemplates && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-white font-semibold mb-3">Quick Start Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg cursor-pointer transition-colors border border-gray-600 hover:border-[#6366f1]/50"
              >
                <h5 className="font-semibold text-white text-sm mb-1">{template.name}</h5>
                <p className="text-gray-400 text-xs mb-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{getScheduleIcon(template.schedule)} {template.schedule}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.complexity === 'low' ? 'bg-green-500/20 text-green-400' :
                    template.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {template.complexity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Agent Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-white font-semibold mb-3">Create New Agent</h4>
          <form onSubmit={handleCreateAgent} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Agent Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                required
              />
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value as any})}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
            <textarea
              placeholder="Task Prompt (what should the agent do?)"
              value={formData.task_prompt}
              onChange={(e) => setFormData({...formData, task_prompt: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              >
                <option value="news">News</option>
                <option value="analysis">Analysis</option>
                <option value="monitoring">Monitoring</option>
                <option value="content">Content</option>
                <option value="other">Other</option>
              </select>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({...formData, complexity: e.target.value as any})}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-[#6366f1] hover:bg-[#6366f1]/80 text-white rounded-lg transition-colors"
              >
                Create Agent
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agents List */}
      <div className="space-y-3">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-300">No agents yet</h3>
            <p className="mt-1 text-xs text-gray-500">Create your first AI agent to automate tasks 24/7.</p>
          </div>
        ) : (
          agents.map(agent => (
            <div key={agent.id} className="bg-[#0a0a0a] rounded-lg border border-[#333] p-4 hover:bg-[#1a1a1a] transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-white font-semibold">{agent.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      agent.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 bg-[#333] rounded text-xs text-gray-300">
                      {agent.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{agent.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{getScheduleIcon(agent.schedule)} {agent.schedule}</span>
                    <span>Runs: {agent.total_runs}</span>
                    {agent.last_run && (
                      <span>Last: {new Date(agent.last_run).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRunAgent(agent.id)}
                    disabled={runningAgents.has(agent.id)}
                    className="px-2 py-1 text-xs bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#3b82f6] rounded transition-colors disabled:opacity-50"
                  >
                    {runningAgents.has(agent.id) ? 'Running...' : 'Run Now'}
                  </button>
                  <button
                    onClick={() => handleToggleAgent(agent.id, !agent.is_active)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      agent.is_active 
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                    }`}
                  >
                    {agent.is_active ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedAgent?.id === agent.id) {
                        setSelectedAgent(null)
                        setAgentRuns([])
                      } else {
                        setSelectedAgent(agent)
                        fetchAgentRuns(agent.id)
                      }
                    }}
                    className="px-2 py-1 text-xs bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded transition-colors"
                  >
                    {selectedAgent?.id === agent.id ? 'Hide' : 'View'} Runs
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Agent Runs */}
              {selectedAgent?.id === agent.id && (
                <div className="mt-6 pt-6 border-t border-[#333]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold text-lg">Execution History</h4>
                    <span className="text-gray-400 text-sm">Last 10 runs</span>
                  </div>
                  
                  <div className="space-y-4">
                    {agentRuns.length === 0 ? (
                      <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700/50">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-700/50 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h5 className="text-gray-300 font-medium mb-1">No executions yet</h5>
                        <p className="text-gray-500 text-sm">Click "Run Now" to start your first execution</p>
                      </div>
                    ) : (
                      agentRuns.map((run, index) => (
                        <div key={run.id} className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-200">
                          {/* Run Header */}
                          <div className="px-4 py-3 bg-gray-800/30 border-b border-gray-700/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  run.status === 'completed' ? 'bg-emerald-400' :
                                  run.status === 'running' ? 'bg-blue-400 animate-pulse' :
                                  run.status === 'failed' ? 'bg-red-400' :
                                  'bg-gray-400'
                                }`}></div>
                                <span className={`text-sm font-medium ${
                                  run.status === 'completed' ? 'text-emerald-300' :
                                  run.status === 'running' ? 'text-blue-300' :
                                  run.status === 'failed' ? 'text-red-300' :
                                  'text-gray-300'
                                }`}>
                                  {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                                </span>
                                {run.model_used && (
                                  <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 rounded-md">
                                    {run.model_used}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                {run.tokens_used && (
                                  <span className="flex items-center space-x-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>{run.tokens_used} tokens</span>
                                  </span>
                                )}
                                <span>{new Date(run.started_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Run Content */}
                          <div className="p-4">
                            {run.result ? (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-emerald-300 text-sm font-medium">Task Completed</span>
                                </div>
                                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                                  <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                                      {run.result}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Execution #{agentRuns.length - index}</span>
                                  {run.completed_at && (
                                    <span>Duration: {Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s</span>
                                  )}
                                </div>
                              </div>
                            ) : run.error_message ? (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-red-300 text-sm font-medium">Execution Failed</span>
                                </div>
                                <div className="bg-red-900/20 rounded-lg p-3 border border-red-700/30">
                                  <p className="text-red-200 text-sm">{run.error_message}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                <span className="ml-2 text-gray-400 text-sm">Processing...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Stats */}
                  {agentRuns.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-700/30">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-400">
                            {agentRuns.filter(r => r.status === 'completed').length}
                          </div>
                          <div className="text-xs text-gray-500">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">
                            {agentRuns.filter(r => r.status === 'failed').length}
                          </div>
                          <div className="text-xs text-gray-500">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {agentRuns.filter(r => r.status === 'running').length}
                          </div>
                          <div className="text-xs text-gray-500">Running</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 