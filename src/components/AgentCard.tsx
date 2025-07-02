import React from 'react'

export interface Agent {
  id: string
  name: string
  description: string
  is_active: boolean
  category: string
  model: string
  complexity: 'low' | 'medium' | 'high'
  last_run?: string
  total_runs?: number
}

interface AgentCardProps {
  agent: Agent
  onToggleActive?: (id: string, isActive: boolean) => void
  onRun?: (id: string) => void
}

export default function AgentCard({ agent, onToggleActive, onRun }: AgentCardProps) {
  return (
    <div className={`rounded-xl bg-white/60 dark:bg-[#23233a]/60 border border-[#e5e7eb]/60 dark:border-[#23233a]/60 shadow-lg p-6 mb-4 transition-all ${agent.is_active ? 'ring-2 ring-emerald-400/30 scale-[1.01]' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{agent.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-300">{agent.category} &middot; {agent.model} &middot; {agent.complexity}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleActive?.(agent.id, !agent.is_active)} className={`text-xs px-3 py-1 rounded ${agent.is_active ? 'bg-emerald-400/10 text-emerald-600' : 'bg-gray-400/10 text-gray-600'} hover:bg-emerald-400/20 transition`}>{agent.is_active ? 'Deactivate' : 'Activate'}</button>
          <button onClick={() => onRun?.(agent.id)} className="text-xs px-3 py-1 rounded bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition">Run</button>
        </div>
      </div>
      <div className="mt-2 text-gray-700 dark:text-gray-200">{agent.description}</div>
      <div className="mt-2 text-xs text-gray-400">Last run: {agent.last_run ? new Date(agent.last_run).toLocaleString() : 'Never'} &middot; Total runs: {agent.total_runs ?? 0}</div>
    </div>
  )
} 