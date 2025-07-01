'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

interface AIInsightsProps {
  user: User
}

interface AIInsightsData {
  insights: string[]
  recommendations: string[]
  productivityTips: string[]
  usageAnalysis: string
}

export default function AIInsights({ user }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateInsights()
  }, [])

  const generateInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      setInsights(data)
    } catch (err) {
      console.error('Error generating insights:', err)
      setError('Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6">
        <h2 className="text-xl font-bold text-white mb-4">AI Insights</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6">
        <h2 className="text-xl font-bold text-white mb-4">AI Insights</h2>
        <div className="text-red-400 text-sm mb-3">{error}</div>
        <button
          onClick={generateInsights}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6">
        <h2 className="text-xl font-bold text-white mb-4">AI Insights</h2>
        <div className="text-gray-400 text-sm">No insights available</div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">AI Insights</h2>
        <button
          onClick={generateInsights}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Refresh insights"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Key Insights */}
        {insights.insights.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Insights
            </h3>
            <ul className="space-y-1">
              {insights.insights.slice(0, 3).map((insight, index) => (
                <li key={index} className="text-xs text-gray-400 flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recommendations
            </h3>
            <ul className="space-y-1">
              {insights.recommendations.slice(0, 2).map((rec, index) => (
                <li key={index} className="text-xs text-gray-400 flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Productivity Tips */}
        {insights.productivityTips.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Productivity Tip
            </h3>
            <p className="text-xs text-gray-400">
              {insights.productivityTips[0]}
            </p>
          </div>
        )}

        {/* Usage Analysis */}
        {insights.usageAnalysis && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {insights.usageAnalysis}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 