// src/app/onboarding/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import OnboardingForm from '@/components/OnboardingForm'
import { User } from '@supabase/supabase-js'

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabaseBrowser.auth.getUser()
      console.log("Fetched user:", data?.user)
      if (!error && data?.user) setUser(data.user)
    }
  
    getUser()
  }, [])
  
  if (!user) {
    return <div className="text-white p-10">Loading...</div>
  }

  return <OnboardingForm user={user} />
}
