'use client'

import { useState, useEffect } from 'react'
import AIOutputRenderer from './AIOutputRenderer'

interface AIInsightsProps {
  user: object
}

export default function AIInsights({ user }: AIInsightsProps) {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateInsights = async () => {
      try {
        // Generate insights using Groq AI
        const response = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: (user as { id: string }).id })
        })

        if (response.ok) {
          const data = await response.json()
          setInsights(data.insights || [])
        }
      } catch (error) {
        console.error('Error generating insights:', error)
      } finally {
        setLoading(false)
      }
    }

    generateInsights()
  }, [user])

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Insights</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#1f1f1f] rounded-xl p-6 border border-gray-200 dark:border-[#333] shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Insights</h3>
      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <AIOutputRenderer text={insight} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No insights available yet.</p>
      )}
    </div>
  )
} 