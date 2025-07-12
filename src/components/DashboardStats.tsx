'use client'

import React from 'react'

interface DashboardStatsProps {
  agentStats: {
    total: number
    active: number
    totalRuns: number
  }
}

export default function DashboardStats({ agentStats }: DashboardStatsProps) {

  // Add agent stats cards if provided
  const agentCards = agentStats
    ? [
        {
          title: 'Total Agents',
          value: agentStats.total,
          change: '+2%',
          changeType: 'positive',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          color: 'from-[#6366f1] to-[#8b5cf6]'
        },
        {
          title: 'Active Agents',
          value: agentStats.active,
          change: '+1%',
          changeType: 'positive',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          color: 'from-[#10b981] to-[#059669]'
        },
        {
          title: 'Total Agent Runs',
          value: agentStats.totalRuns,
          change: '+10%',
          changeType: 'positive',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          color: 'from-[#f59e0b] to-[#d97706]'
        }
      ]
    : []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {agentCards.map((card, index) => (
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