'use client'

import React from 'react'

interface DashboardStatsProps {
  stats: {
    total: number
    pending: number
    completed: number
    inProgress: number
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      change: '+12%',
      changeType: 'positive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-[#6366f1] to-[#8b5cf6]'
    },
    {
      title: 'Pending',
      value: stats.pending,
      change: '+5%',
      changeType: 'neutral',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-[#f59e0b] to-[#d97706]'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      change: '+8%',
      changeType: 'positive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'from-[#3b82f6] to-[#1d4ed8]'
    },
    {
      title: 'Completed',
      value: stats.completed,
      change: '+15%',
      changeType: 'positive',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-[#10b981] to-[#059669]'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className="bg-[#1f1f1f] rounded-lg p-5 border border-[#333] hover:bg-[#2a2a2a] transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${
                  card.changeType === 'positive' ? 'text-green-400' : 
                  card.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {card.change}
                </span>
                <span className="text-gray-500 text-xs ml-1">from last month</span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 