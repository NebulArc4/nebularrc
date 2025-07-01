'use client'

import { User } from '@supabase/supabase-js'

interface AIInsightsProps {
  user: User
}

export default function AIInsights({ user }: AIInsightsProps) {
  // Example: show a random tip or stat
  const tips = [
    'Tip: Use clear, specific prompts for better AI results.',
    'Did you know? You can automate repetitive tasks with custom agents.',
    'Try combining multiple tasks for more powerful workflows.',
    'AI can summarize, translate, and analyze your data instantly.',
    'Explore the Agent Manager to create your own AI workflows.'
  ]
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <div className="bg-[#1a1a1a]/50 backdrop-blur-xl rounded-xl border border-[#333] p-6 flex flex-col items-start">
      <h2 className="text-xl font-bold text-white mb-2">AI Insights</h2>
      <div className="flex items-center space-x-3 mb-2">
        <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-base text-gray-300">{randomTip}</span>
      </div>
      <div className="text-xs text-gray-500 mt-2">User: {user.email}</div>
    </div>
  )
} 