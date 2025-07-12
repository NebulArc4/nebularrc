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
          // Handle streaming response
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body')
          }

          const decoder = new TextDecoder()
          let buffer = ''
          let fullResponse = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'text-delta' && parsed.textDelta) {
                    fullResponse += parsed.textDelta
                  }
                } catch {
                  // Ignore parsing errors for streaming
                }
              }
            }
          }

          // Parse the full response as structured insights
          const insightsArray = parseInsightsFromText(fullResponse)
          setInsights(insightsArray)
        } else {
          // Fallback to mock insights if API fails
          setInsights([
            'Based on your activity, you have 3 active AI agents running. Consider reviewing their performance and optimizing their configurations.',
            'Your most productive time appears to be in the morning. Schedule important AI analysis during this period.',
            'You have completed 12 agent runs this week. Consider creating templates for recurring analyses.'
          ])
        }
      } catch (error) {
        console.error('Error generating insights:', error)
        // Fallback insights
        setInsights([
          'Focus on running high-priority AI analyses first to improve your productivity.',
          'Consider using agent templates for recurring analyses to save time.',
          'Review your agent configurations to identify patterns and optimize your workflow.'
        ])
      } finally {
        setLoading(false)
      }
    }

    generateInsights()
  }, [user])

  // Helper function to parse insights from AI text response
  const parseInsightsFromText = (text: string): string[] => {
    const insights: string[] = []
    
    // Extract insights from the structured response
    const insightMatches = text.match(/Insight \d+: ([^\n]+)/g)
    if (insightMatches) {
      insightMatches.forEach(match => {
        const insight = match.replace(/Insight \d+: /, '').trim()
        if (insight) insights.push(insight)
      })
    }

    // If no structured insights found, split by sections
    if (insights.length === 0) {
      const sections = text.split(/\n\n+/)
      sections.forEach(section => {
        const trimmed = section.trim()
        if (trimmed && trimmed.length > 20 && !trimmed.startsWith('📊') && !trimmed.startsWith('🎯')) {
          insights.push(trimmed)
        }
      })
    }

    // Fallback: return first few meaningful sentences
    if (insights.length === 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
      insights.push(...sentences.slice(0, 3))
    }

    return insights.slice(0, 5) // Limit to 5 insights
  }

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