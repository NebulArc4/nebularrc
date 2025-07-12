// src/app/onboarding/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import OnboardingForm from '@/components/OnboardingForm'
import { User } from '@supabase/supabase-js'

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      try {
        const { data, error } = await supabase.auth.getUser()
        console.log("Fetched user:", data?.user)
        if (error) {
          console.error('Error fetching user:', error)
          return
        }
        setUser(data?.user ?? null)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access the onboarding page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <OnboardingForm user={user} />
    </div>
  )
}
