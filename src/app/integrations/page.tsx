import React from 'react'

const integrations = [
  { name: 'Groq AI', description: 'Lightning-fast LLMs for all your AI tasks.', icon: (
    <svg className="w-8 h-8 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" /></svg>
  ) },
  { name: 'Supabase', description: 'Secure authentication and database.', icon: (
    <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
  ) },
  { name: 'Webhooks', description: 'Trigger workflows and connect external services.', icon: (
    <svg className="w-8 h-8 text-[#f59e42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 16h10M7 12h4" /></svg>
  ) },
]

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23233a] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-4">Integrations</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Connect NebulArc with your favorite tools and platforms.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {integrations.map((i) => (
          <div key={i.name} className="card flex items-center space-x-4 bg-white/60 dark:bg-[#23233a]/60 backdrop-blur-xl border border-[#e5e7eb]/60 dark:border-[#23233a]/60">
            <div>{i.icon}</div>
            <div>
              <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{i.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{i.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 