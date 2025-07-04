'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'

interface QuickActionsProps {
  user?: User
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  placeholder: string
  color: string
}

export default function QuickActions({ }: QuickActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'analyze',
      title: 'Analyze Data',
      description: 'Quick data analysis and insights',
      placeholder: 'Paste your data here for analysis...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'summarize',
      title: 'Summarize Text',
      description: 'Create concise summaries',
      placeholder: 'Paste text to summarize...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'translate',
      title: 'Translate',
      description: 'Translate text between languages',
      placeholder: 'Paste text to translate...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'code_review',
      title: 'Code Review',
      description: 'Review and improve code',
      placeholder: 'Paste code for review...',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: 'from-orange-500 to-red-500'
    }
  ]

  const handleQuickAction = async (action: QuickAction) => {
    if (!content.trim()) {
      setError('Please enter some content to process')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/quick-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: action.id,
          content: content.trim(),
          context: `Processing ${action.title.toLowerCase()} request`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process action')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      console.error('Error processing quick action:', error)
      setError('Failed to process action. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAction = () => {
    setSelectedAction(null)
    setContent('')
    setResult(null)
    setError(null)
  }

  const selectedActionData = quickActions.find(action => action.id === selectedAction)

  return (
    <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        <div className="text-sm text-gray-400">AI-powered tasks</div>
      </div>
      
      {!selectedAction ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className="group relative p-4 rounded-lg bg-[#2a2a2a]/50 border border-[#444] hover:border-[#6366f1] transition-all duration-200 hover:bg-[#2a2a2a]/70"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                </div>
              </div>
              
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6366f1]/5 to-[#8b5cf6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={resetAction}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-white">{selectedActionData?.title}</h3>
            </div>
          </div>

          {/* Input Area */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={selectedActionData?.placeholder}
              rows={6}
              className="w-full px-4 py-3 bg-[#2a2a2a]/50 border border-[#444] rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-transparent text-white placeholder-gray-400 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Result Area */}
          {result && (
            <div className="bg-[#2a2a2a]/50 border border-[#444] rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Result</h4>
              <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {result}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={resetAction}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={() => selectedActionData && handleQuickAction(selectedActionData)}
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5b5beb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Process with AI</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 