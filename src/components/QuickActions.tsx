'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'

interface QuickActionsProps {
  user: User
}

export default function QuickActions({ user }: QuickActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const quickActions = [
    {
      id: 'analyze',
      title: 'Analyze Data',
      description: 'Quick data analysis and insights',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      prompt: 'Analyze the following data and provide insights:',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'summarize',
      title: 'Summarize Text',
      description: 'Create concise summaries',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      prompt: 'Summarize the following text in a concise manner:',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'translate',
      title: 'Translate',
      description: 'Translate text between languages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      prompt: 'Translate the following text to English:',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'code',
      title: 'Code Review',
      description: 'Review and improve code',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      prompt: 'Review this code and suggest improvements:',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_prompt: action.prompt,
          user_id: user.id,
        }),
      })

      if (response.ok) {
        // Refresh the page to show the new task
        window.location.reload()
      } else {
        console.error('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        <div className="text-sm text-gray-400">Common tasks</div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action)}
            disabled={isSubmitting}
            className="group relative p-4 rounded-lg bg-[#2a2a2a]/50 border border-[#444] hover:border-[#6366f1] transition-all duration-200 hover:bg-[#2a2a2a]/70 disabled:opacity-50 disabled:cursor-not-allowed"
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
            
            {/* Hover effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6366f1]/5 to-[#8b5cf6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        ))}
      </div>
      
      {isSubmitting && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-blue-400 text-sm">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating task...
          </div>
        </div>
      )}
    </div>
  )
} 