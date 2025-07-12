'use client'

import { useState } from 'react'

export default function InfoBanner() {
  const [showBanner, setShowBanner] = useState(true)
  if (!showBanner) return null
  return (
    <div className="relative mb-6 animate-fade-in">
      <div className="bg-white/70 dark:bg-[#23233a]/70 border border-[#e5e7eb]/60 dark:border-[#23233a]/60 rounded-xl px-6 py-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-medium text-gray-900 dark:text-white">New: Try the improved Agents UI, modals, and toasts! 🎉</span>
        </div>
        <button onClick={() => setShowBanner(false)} aria-label="Dismiss info banner" className="ml-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
      </div>
    </div>
  )
} 