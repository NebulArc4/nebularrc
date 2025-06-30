'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // ✅ Redirect to onboarding
      router.push('/onboarding')
    }
  }

  return (
    <form onSubmit={handleSignup}>
      {/* signup form fields here */}
    </form>
  )
}
