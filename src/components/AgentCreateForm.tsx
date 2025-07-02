import React, { useState } from 'react'

export interface AgentCreateFormProps {
  onSuccess?: () => void
}

const initialFormData = {
  name: '',
  description: '',
  task_prompt: '',
  schedule: 'daily',
  custom_schedule: '',
  category: 'other',
  model: 'llama3-8b-8192',
  complexity: 'medium'
}

export default function AgentCreateForm({ onSuccess }: AgentCreateFormProps) {
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setFormData(initialFormData)
        if (onSuccess) onSuccess()
      } else {
        setError('Error creating agent')
      }
    } catch (err) {
      setError('Error creating agent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Task Prompt</label>
        <input name="task_prompt" value={formData.task_prompt} onChange={handleChange} required className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80" />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Schedule</label>
          <select name="schedule" value={formData.schedule} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80">
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {formData.schedule === 'custom' && (
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Custom Schedule</label>
            <input name="custom_schedule" value={formData.custom_schedule} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80" />
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Category</label>
          <input name="category" value={formData.category} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Model</label>
          <input name="model" value={formData.model} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Complexity</label>
          <select name="complexity" value={formData.complexity} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end gap-2">
        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold shadow-lg hover:from-[#6366f1] hover:to-[#6366f1] transition-all disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Agent'}
        </button>
      </div>
    </form>
  )
} 