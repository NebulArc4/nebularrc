'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function OnboardingForm({ user }: { user: User }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name,
      role,
    })

    setLoading(false)

    if (error) {
      alert('Something went wrong. Try again.')
    } else {
      router.push('/dashboard') // After onboarding, go to main app
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-20 px-4 text-white">
      <h2 className="text-3xl font-bold mb-6">&apos;Let&apos;s get to know you!</h2>

      <div className="mb-4">
        <label className="block mb-1">Your Name</label>
        <input
          type="text"
          className="w-full px-4 py-2 rounded-md bg-transparent border border-white text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

      </div>

      <div className="mb-6">
        <label className="block mb-1">Your Role / Focus</label>
        <input
          type="text"
          className="w-full px-4 py-2 rounded-md bg-transparent border border-white text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your role or focus"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />

      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  )
}
