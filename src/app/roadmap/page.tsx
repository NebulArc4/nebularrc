import React from 'react'

const roadmap = [
  { title: 'PDF Annotation', status: 'Live', desc: 'Upload PDFs, extract content, and get annotated results.' },
  { title: 'Agent Analytics', status: 'Live', desc: 'Track agent performance and usage.' },
  { title: 'Integrations', status: 'In Progress', desc: 'APIs, webhooks, and more.' },
  { title: 'Mobile App', status: 'Planned', desc: 'Access NebulArc on the go.' },
  { title: 'Marketplace', status: 'Planned', desc: 'Share and discover agent templates.' },
]

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23233a] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-4">Product Roadmap</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">See what's live, what's coming soon, and what's planned for NebulArc.</p>
      </div>
      <div className="max-w-2xl mx-auto">
        <ol className="relative border-l-4 border-[#6366f1]/30">
          {roadmap.map((item, i) => (
            <li key={item.title} className="mb-10 ml-6">
              <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full ring-8 ring-white dark:ring-[#18181b] ${item.status === 'Live' ? 'bg-green-400' : item.status === 'In Progress' ? 'bg-yellow-400' : 'bg-gray-400'}`}></span>
              <div className="card bg-white/60 dark:bg-[#23233a]/60 backdrop-blur-xl border border-[#e5e7eb]/60 dark:border-[#23233a]/60">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${item.status === 'Live' ? 'bg-green-100 text-green-700' : item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
} 