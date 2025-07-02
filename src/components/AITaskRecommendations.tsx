'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

interface AITaskRecommendationsProps {
  user: User
}

interface TaskRecommendation {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  complexity: 'low' | 'medium' | 'high'
  reason: string
}

export default function AITaskRecommendations({ user }: AITaskRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateRecommendations()
  }, [])

  const generateRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's recent activity for context
      const response = await fetch('/api/tasks')
      const tasks = await response.json()

      // Generate recommendations using Groq AI
      const aiResponse = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!aiResponse.ok) {
        throw new Error('Failed to generate recommendations')
      }

      const insights = await aiResponse.json()
      
      // Create task recommendations based on insights
      const taskRecommendations: TaskRecommendation[] = [
        {
          id: '1',
          title: 'Data Analysis Task',
          description: 'Analyze your recent task patterns and performance metrics',
          prompt: 'Analyze my recent task completion patterns and provide insights on productivity trends, common themes, and areas for improvement.',
          category: 'data-analysis',
          complexity: 'medium',
          reason: insights.recommendations?.[0] || 'Based on your activity patterns'
        },
        {
          id: '2',
          title: 'Workflow Optimization',
          description: 'Optimize your current workflow and processes',
          prompt: 'Review my current task management workflow and suggest optimizations for better efficiency and productivity.',
          category: 'automation',
          complexity: 'high',
          reason: insights.recommendations?.[1] || 'To improve your workflow efficiency'
        },
        {
          id: '3',
          title: 'Content Summary',
          description: 'Summarize your recent task results and findings',
          prompt: 'Create a comprehensive summary of my recent completed tasks, highlighting key insights and actionable takeaways.',
          category: 'content-generation',
          complexity: 'low',
          reason: insights.recommendations?.[2] || 'To consolidate your recent work'
        }
      ]

      setRecommendations(taskRecommendations)
    } catch (err) {
      console.error('Error generating recommendations:', err)
      setError('Failed to generate recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (recommendation: TaskRecommendation) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_prompt: recommendation.prompt,
          category: recommendation.category,
          complexity: recommendation.complexity,
          task_type: 'insights'
        }),
      })

      if (response.ok) {
        // Show success feedback
        alert('Task created successfully!')
        window.location.reload()
      } else {
        throw new Error('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-[#333] p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Task Recommendations</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/80 dark:bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-[#333] p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Task Recommendations</h2>
        <div className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</div>
        <button
          onClick={generateRecommendations}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/80 dark:bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Task Recommendations</h2>
        <button
          onClick={generateRecommendations}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          title="Refresh recommendations"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="bg-gray-50 dark:bg-[#2a2a2a]/50 border border-gray-200 dark:border-[#444] rounded-lg p-4 hover:border-[#6366f1]/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {recommendation.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                  {recommendation.description}
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-xs">
                  Why: {recommendation.reason}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  recommendation.complexity === 'low' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                  recommendation.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                  'bg-red-500/20 text-red-600 dark:text-red-400'
                }`}>
                  {recommendation.complexity}
                </span>
                <span className="text-gray-500 dark:text-gray-500 text-xs capitalize">
                  {recommendation.category.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => handleCreateTask(recommendation)}
              className="w-full px-3 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5b5beb] transition-colors text-sm"
            >
              Create Task
            </button>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">No recommendations available</div>
          <div className="text-gray-500 dark:text-gray-500 text-xs">
            Complete more tasks to get personalized recommendations
          </div>
        </div>
      )}
    </div>
  )
} 