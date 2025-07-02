'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import ThemeToggle from './ThemeToggle'

interface DashboardHeaderProps {
  user: User
  profile: any
}

export default function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task',
      message: 'Task "Summarize report" completed successfully.',
      time: '2m ago',
      read: false
    },
    {
      id: 2,
      type: 'agent',
      message: 'Agent "Data Analyzer" ran into an error.',
      time: '10m ago',
      read: false
    },
    {
      id: 3,
      type: 'system',
      message: 'Welcome to NebulArc! Explore new features.',
      time: '1h ago',
      read: true
    }
  ])

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })))
    }
  }, [showNotifications])

  return (
    <header className="sticky top-0 z-30 w-full bg-white/60 dark:bg-[#18181b]/60 backdrop-blur-xl shadow-lg border-b border-[#e5e7eb]/60 dark:border-[#23233a]/60 flex items-center justify-between px-8 py-4 mb-8">
      <div className="flex items-center space-x-4">
        <span className="text-2xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">NebulArc</span>
      </div>
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-full bg-white/40 dark:bg-[#23233a]/40 hover:bg-white/70 dark:hover:bg-[#23233a]/70 transition-colors">
          <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
        </button>
        <ThemeToggle />
        {/* User avatar */}
        <a href="/dashboard/profile" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="hidden md:inline text-gray-700 dark:text-gray-200 font-semibold group-hover:text-[#6366f1] transition-colors">
            {profile?.name || user?.email?.split('@')[0] || 'User'}
          </span>
        </a>
      </div>
    </header>
  )
} 