import React from 'react'

const team = [
  { name: 'Daanveer', role: 'Founder & Lead Engineer', avatar: '/public/globe.svg' },
  { name: 'NebulArc AI', role: 'AI Product Designer', avatar: '/public/window.svg' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23233a] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-4">About NebulArc</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Our mission is to empower everyone with accessible, powerful, and beautiful AI automation tools.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <div className="card bg-white/60 dark:bg-[#23233a]/60 backdrop-blur-xl border border-[#e5e7eb]/60 dark:border-[#23233a]/60">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Mission</h3>
          <p className="text-gray-600 dark:text-gray-300">To democratize advanced AI and automation, making it accessible, secure, and delightful for all users and teams.</p>
        </div>
        <div className="card bg-white/60 dark:bg-[#23233a]/60 backdrop-blur-xl border border-[#e5e7eb]/60 dark:border-[#23233a]/60">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Vision</h3>
          <p className="text-gray-600 dark:text-gray-300">To become the world's most trusted platform for AI-driven productivity, creativity, and collaboration.</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Meet the Team</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mb-2 shadow-lg overflow-hidden">
                <img src={member.avatar} alt={member.name} className="w-16 h-16 object-contain" />
              </div>
              <div className="font-bold text-gray-900 dark:text-white">{member.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{member.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 