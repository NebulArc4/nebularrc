'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { taskTemplates, getTemplatesByCategory, getCategories, TaskTemplate } from '@/lib/task-templates'
import { modelManager, AIModel } from '@/lib/model-manager'
import toast, { Toaster } from 'react-hot-toast'

interface TaskSubmissionFormProps {
  user: User
}

export default function TaskSubmissionForm({ user }: TaskSubmissionFormProps) {
  const [taskPrompt, setTaskPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')

  const categories = getCategories()
  const availableModels = modelManager.getAvailableModels()

  useEffect(() => {
    // Set default model
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0])
    }
  }, [availableModels, selectedModel])

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setTaskPrompt(template.prompt)
    setSelectedModel(modelManager.getModelById(template.suggestedModel) || availableModels[0])
    setShowTemplates(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!taskPrompt.trim()) {
      toast.error('Please enter a task prompt.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_prompt: taskPrompt,
          model: selectedModel?.id || 'llama3-8b-8192',
          category: selectedTemplate?.category || 'other',
          complexity: selectedTemplate?.complexity || 'medium',
          estimated_tokens: selectedTemplate?.estimatedTokens || 500,
        }),
      })

      if (response.ok) {
        setTaskPrompt('')
        setSelectedTemplate(null)
        toast.success('Task submitted successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit task.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = selectedCategory === 'all' 
    ? taskTemplates.filter(t => 
        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(templateSearch.toLowerCase())
      )
    : getTemplatesByCategory(selectedCategory).filter(t => 
        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(templateSearch.toLowerCase())
      )

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Submit AI Task</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1.5 text-sm bg-[#6366f1]/20 hover:bg-[#6366f1]/30 text-[#6366f1] rounded-lg transition-colors"
          >
            {showTemplates ? 'Hide' : 'Show'} Templates
          </button>
          <button
            type="button"
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="px-3 py-1.5 text-sm bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#8b5cf6] rounded-lg transition-colors"
          >
            {showModelSelector ? 'Hide' : 'Show'} Models
          </button>
        </div>
      </div>

      {/* Task Templates */}
      {showTemplates && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg cursor-pointer transition-colors border border-gray-600 hover:border-[#6366f1]/50"
              >
                <h4 className="font-semibold text-white text-sm mb-1">{template.name}</h4>
                <p className="text-gray-400 text-xs mb-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.complexity === 'low' ? 'bg-green-500/20 text-green-400' :
                    template.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {template.complexity}
                  </span>
                  <span className="text-gray-500 text-xs">{template.estimatedTokens} tokens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Selector */}
      {showModelSelector && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-white font-semibold mb-3">Select AI Model</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableModels.map(model => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                  selectedModel?.id === model.id
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]'
                    : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-white text-sm">{model.name}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    model.quality === 'high' ? 'bg-green-500/20 text-green-400' :
                    model.quality === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {model.quality}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-2">{model.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{model.speed}</span>
                  <span>{model.costPerToken === 0 ? 'Free' : `$${model.costPerToken}/token`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="mb-4 p-3 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[#6366f1] font-semibold">Using Template: {selectedTemplate.name}</h4>
            <button
              onClick={() => {
                setSelectedTemplate(null)
                setTaskPrompt('')
              }}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear
            </button>
          </div>
          <p className="text-gray-300 text-sm">{selectedTemplate.description}</p>
        </div>
      )}

      {/* Selected Model Info */}
      {selectedModel && (
        <div className="mb-4 p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-[#8b5cf6] font-semibold">Selected Model: {selectedModel.name}</h4>
            <span className="text-gray-400 text-sm">{selectedModel.provider}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Task Prompt
          </label>
          <textarea
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            placeholder="Describe your AI task..."
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#6366f1] hover:bg-[#6366f1]/80 text-white rounded-lg transition-colors flex items-center justify-center disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : 'Submit Task'}
        </button>
      </form>
    </div>
  )
}
