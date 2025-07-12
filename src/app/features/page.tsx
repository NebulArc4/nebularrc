import React from 'react'

const features = [
  {
    title: 'AI Analysis Automation',
description: 'Automate complex workflows and analyses with advanced Groq AI agents.',
    icon: (
      <svg className="w-8 h-8 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )
  },
  {
    title: 'PDF & File Intelligence',
    description: 'Upload PDFs, extract content, and get annotated results as downloadable PDFs.',
    icon: (
      <svg className="w-8 h-8 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    )
  },
  {
    title: 'Real-Time Insights',
    description: 'Get actionable insights, recommendations, and analytics for your data and agents.',
    icon: (
      <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a4 4 0 01-4-4V7a4 4 0 018 0v6a4 4 0 01-4 4z" /></svg>
    )
  },
  {
    title: 'Integrations',
    description: 'Connect with APIs, webhooks, and external data sources for seamless automation.',
    icon: (
      <svg className="w-8 h-8 text-[#f59e42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 16h10M7 12h4" /></svg>
    )
  },
  {
    title: 'Dark/Light Mode',
    description: 'Enjoy a beautiful, accessible interface in both dark and light themes.',
    icon: (
      <svg className="w-8 h-8 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 4.95l-.71-.71M4.05 4.05l-.71-.71" /></svg>
    )
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23233a] py-16 px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-4">NebulArc Features</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Discover the power of next-gen AI automation, PDF intelligence, and seamless integrations—all in a beautiful, modern interface.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {features.map((f) => (
          <div key={f.title} className="card flex items-start space-x-4 bg-white/60 dark:bg-[#23233a]/60 backdrop-blur-xl border border-[#e5e7eb]/60 dark:border-[#23233a]/60">
            <div>{f.icon}</div>
            <div>
              <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <a href="/dashboard" className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold text-lg shadow-lg hover:from-[#6366f1] hover:to-[#6366f1] transition-all">Try NebulArc Now</a>
      </div>
    </div>
  )
} 