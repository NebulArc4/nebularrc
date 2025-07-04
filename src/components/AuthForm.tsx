'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async () => {
    setMessage('')
    setLoading(true)
    
    if (!email || !password) {
      setMessage('Email and password are required.')
      setLoading(false)
      return
    }

    try {
      const {
        data: authData,
      } = isLogin
        ? await supabaseBrowser.auth.signInWithPassword({ email, password })
        : await supabaseBrowser.auth.signUp({ email, password })

      if (authData.user) {
        // Check if user has a profile
        const { data: profile } = await supabaseBrowser
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single()

        if (profile) {
          // User has profile, redirect to dashboard
          router.push('/dashboard')
        } else {
          // User needs to complete onboarding
          router.push('/onboarding')
        }
      }
    } catch {
      setLoading(false)
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 text-white p-8 rounded-xl shadow-lg mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Login to NebulArc' : 'Create an account'}
      </h2>

      <input
        className="w-full px-4 py-2 mb-4 rounded bg-gray-800 border border-white text-white placeholder-gray-400"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <input
        className="w-full px-4 py-2 mb-4 rounded bg-gray-800 border border-white text-white placeholder-gray-400"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors py-2 rounded font-semibold disabled:opacity-50"
      >
        {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
      </button>

      <p className="text-sm mt-4 text-center text-gray-400">
        {isLogin ? 'New here?' : 'Already have an account?'}{' '}
        <button 
          className="underline" 
          onClick={() => setIsLogin(!isLogin)}
          disabled={loading}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>

      {message && <p className="text-center text-red-400 mt-4">{message}</p>}
    </div>
  )
}

