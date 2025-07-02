'use client'

import React from 'react'

export interface Task {
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

interface TaskCardProps {
  task: Task
  expanded?: boolean
  onExpand?: (id: string) => void
  onDownloadPDF?: (result?: string) => void
}

export default function TaskCard({ task, expanded, onExpand, onDownloadPDF }: TaskCardProps) {
  return (
    <div className={`rounded-xl bg-white/60 dark:bg-[#23233a]/60 border border-[#e5e7eb]/60 dark:border-[#23233a]/60 shadow-lg p-6 mb-4 transition-all ${expanded ? 'ring-2 ring-[#6366f1]/30 scale-[1.01]' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-400' : task.status === 'in_progress' ? 'bg-blue-400' : task.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
          <span className="font-semibold text-gray-900 dark:text-white">{task.task_prompt}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onExpand?.(task.id)} className="text-xs px-3 py-1 rounded bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 transition">{expanded ? 'Collapse' : 'Expand'}</button>
          {task.result && <button onClick={() => onDownloadPDF?.(task.result)} className="text-xs px-3 py-1 rounded bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white hover:from-[#6366f1] hover:to-[#6366f1] transition">Download PDF</button>}
        </div>
      </div>
      {expanded && (
        <div className="mt-4 text-gray-700 dark:text-gray-200">
          <div className="mb-2"><span className="font-bold">Status:</span> {task.status}</div>
          {task.result && <div className="mb-2"><span className="font-bold">Result:</span> {task.result}</div>}
          {task.error_message && <div className="mb-2 text-red-500"><span className="font-bold">Error:</span> {task.error_message}</div>}
          <div className="text-xs text-gray-400">Created: {new Date(task.created_at).toLocaleString()}</div>
        </div>
      )}
    </div>
  )
} 