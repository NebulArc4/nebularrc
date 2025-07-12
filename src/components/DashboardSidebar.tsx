'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      href: '/dashboard',
    },

    {
      name: 'Arc Brain',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 0c2.5 2 4 4.5 4 7.5S14.5 17 12 17s-4-3-4-7.5S9.5 4 12 2z" />
        </svg>
      ),
      href: '/dashboard/arc-brain',
    },
    {
      name: 'Agents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      href: '/dashboard/agents',
    },
    {
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: '/dashboard/analytics',
    },
    {
      name: 'Connections',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z" />
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      href: '/dashboard/connections',
    },
    {
      name: 'Info',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
        </svg>
      ),
      href: '/dashboard/info',
    },
    {
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '#settings',
    },
  ]

  return (
    <aside className="hidden lg:block w-64 bg-[#0a0a0a]/50 backdrop-blur-sm border-r border-[#1f1f1f] min-h-screen">
      <div className="p-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-4 text-sm">Quick Actions</h3>
          <div className="space-y-2">
            <button
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-2 px-4 rounded-lg hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200 text-sm font-medium"
              onClick={() => router.push('/dashboard/arc-brain')}
            >
              Arc Brain Analysis
            </button>
            <button className="w-full bg-[#1f1f1f] text-white py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-all duration-200 text-sm font-medium border border-[#333]">
              Import Data
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
            return (
              <a
                key={index}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-[#1f1f1f] text-white border-l-4 border-[#6366f1]'
                    : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  )
} 