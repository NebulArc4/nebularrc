'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
  ) },
  { label: 'Tasks', href: '/tasks', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>
  ) },
  { label: 'Agents', href: '/agents', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm6 0c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm-6 8c0-2.21 3.582-4 8-4s8 1.79 8 4v2H4v-2c0-2.21 3.582-4 8-4z" /></svg>
  ) },
  { label: 'Profile', href: '/profile', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  ) },
  { label: 'Connections', href: '/connections', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
  ) },
]

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <aside
      className={`sticky top-0 z-20 h-screen flex flex-col bg-white/60 dark:bg-[#18181b]/60 backdrop-blur-xl shadow-xl border-r border-[#e5e7eb]/60 dark:border-[#23233a]/60 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} group`}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className="flex-1 flex flex-col py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.href.replace(/#.*$/, ''))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 font-medium text-gray-700 dark:text-gray-200 hover:bg-[#6366f1]/10 hover:text-[#6366f1] ${isActive ? 'bg-[#6366f1]/20 text-[#6366f1]' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`truncate transition-all duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
      <div className={`flex items-center justify-center pb-6 ${collapsed ? 'w-full' : 'justify-end pr-4'}`}>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="p-2 rounded-full bg-white/40 dark:bg-[#23233a]/40 hover:bg-white/70 dark:hover:bg-[#23233a]/70 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          )}
        </button>
      </div>
    </aside>
  )
} 