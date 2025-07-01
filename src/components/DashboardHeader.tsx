'use client'

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
    <header className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1f1f1f] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Nebul<span className="text-red-500">A</span>rc</h1>
              <p className="text-xs text-gray-400">AI Operating System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-white hover:text-[#6366f1] transition-colors text-sm font-medium">
              Dashboard
            </a>
            <a href="#tasks" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Tasks
            </a>
            <a href="/dashboard/analytics" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Analytics
            </a>
            <a href="/dashboard/profile" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Profile
            </a>
            <a href="#settings" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Settings
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01" />
                </svg>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1f1f1f] rounded-lg shadow-lg border border-[#333] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#333] text-white font-semibold">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-4 text-gray-400 text-sm">No notifications</div>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto divide-y divide-[#222]">
                      {notifications.map((n) => (
                        <li key={n.id} className={`px-4 py-3 flex items-start space-x-3 ${n.read ? 'bg-transparent' : 'bg-[#23235a]/10'}`}>
                          <div className="mt-1">
                            {n.type === 'task' && (
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {n.type === 'agent' && (
                              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                            {n.type === 'system' && (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white mb-1">{n.message}</div>
                            <div className="text-xs text-gray-400">{n.time}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="px-4 py-2 border-t border-[#333] text-xs text-gray-400 text-center cursor-pointer hover:text-[#6366f1]">View all notifications</div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white font-medium text-sm">
                    {profile?.name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {profile?.role || 'User'}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1f1f1f] rounded-lg shadow-lg border border-[#333] py-2">
                  <a href="/dashboard/profile" className="block px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm">
                    Profile Settings
                  </a>
                  <a href="#preferences" className="block px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm">
                    Preferences
                  </a>
                  <hr className="border-[#333] my-2" />
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#2a2a2a] hover:text-red-300 transition-colors text-sm"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 