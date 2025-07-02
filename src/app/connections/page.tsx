'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ConnectionsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Link href="/dashboard" className="inline-block mb-4 text-[#6366f1] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-6">Connections</h1>
        <div className="bg-white/60 dark:bg-[#23233a]/60 rounded-xl p-8 shadow-lg mb-8 animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard" className="inline-block mb-4 text-[#6366f1] hover:underline">← Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-6">Connections</h1>
      <div className="bg-white/60 dark:bg-[#23233a]/60 rounded-xl p-8 shadow-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Co-founder Matching (Coming Soon)</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Find and connect with like-minded builders, AI engineers, and entrepreneurs. NebulArc will soon offer a matching platform to help you find your ideal co-founder or collaborators for your next big idea.</p>
        <div className="mt-6">
          <Link href="/waitlist" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold text-lg shadow-lg hover:from-[#6366f1] hover:to-[#6366f1] transition-all">Join the Waitlist</Link>
        </div>
      </div>
    </div>
  )
} 