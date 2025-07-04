'use client'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardSidebar from '@/components/DashboardSidebar'
import { useState } from 'react'

export default function JoinTeamPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    linkedin: '',
    role: '',
    motivation: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Here you would send the form data to your backend or an email service
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
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
          <main className="flex-1 p-8">
            <div className="max-w-xl mx-auto bg-white dark:bg-[#18181b] rounded-xl p-8 border border-gray-200 dark:border-[#333] shadow-lg">
              <h1 className="text-3xl font-bold mb-6 text-center">Join Our Team</h1>
              {submitted ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold mb-2 text-green-500">Thank you for your application!</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">We appreciate your interest. Our team will review your application and get back to you soon.</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
                    <input type="text" name="name" id="name" required value={form.name} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6366f1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" required value={form.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6366f1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="linkedin">LinkedIn Profile</label>
                    <input type="url" name="linkedin" id="linkedin" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6366f1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="role">Role of Interest</label>
                    <input type="text" name="role" id="role" required value={form.role} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6366f1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="motivation">Why do you want to join?</label>
                    <textarea name="motivation" id="motivation" rows={4} required value={form.motivation} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#444] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6366f1]" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-3 rounded-lg font-semibold shadow hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200 disabled:opacity-60">
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 