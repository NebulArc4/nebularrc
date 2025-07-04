'use client'

import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import ModelPerformanceDashboard from '@/components/ModelPerformanceDashboard';
import { useState } from 'react'

export default function InfoPage() {
  const [showModal, setShowModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: '', motivation: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setShowModal(false), 1500)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
      </div>
      <div className="relative z-10">
        <DashboardHeader user={{ id: 'placeholder', email: 'user@example.com', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' }} profile={{}} />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">AI Model Performance Info</h1>
              <ModelPerformanceDashboard />
              {/* Join as Team Member Section */}
              <div className="mt-12 bg-white dark:bg-[#18181b] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-sm">
                <h2 className="text-2xl font-semibold mb-2">Join as Team Member</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-400">Want to contribute to NebulArc? Apply to join our team and help shape the future of AI collaboration.</p>
                <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg font-semibold hover:from-[#5b21b6] hover:to-[#6366f1] transition-all">Apply Now</button>
              </div>
              {/* Modal */}
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-white dark:bg-[#18181b] rounded-xl p-8 w-full max-w-md shadow-lg relative">
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setShowModal(false)}>&times;</button>
                    <h3 className="text-2xl font-bold mb-4">Team Member Application</h3>
                    {submitted ? (
                      <div className="text-green-600 dark:text-green-400 text-center py-8 font-semibold">Application submitted! Thank you.</div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 rounded border bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#444]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 rounded border bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#444]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Role</label>
                          <input name="role" value={form.role} onChange={handleChange} required className="w-full px-3 py-2 rounded border bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#444]" placeholder="e.g. Frontend, Backend, AI Researcher" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Motivation</label>
                          <textarea name="motivation" value={form.motivation} onChange={handleChange} required className="w-full px-3 py-2 rounded border bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-[#444]" rows={3} placeholder="Why do you want to join?" />
                        </div>
                        <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg font-semibold hover:from-[#5b21b6] hover:to-[#6366f1] transition-all">Submit Application</button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 