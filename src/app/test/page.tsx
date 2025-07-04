'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Session } from '@supabase/auth-helpers-nextjs'

export default function TestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [session, setSession] = useState<Session | null>(null)

  const handleLogin = async () => {
    try {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
        return
      }

      setMessage('Login successful!')
      setSession(data.session)
      
      // Check session immediately after login
      const { data: { session: currentSession } } = await supabaseBrowser.auth.getSession()
      console.log('Current session after login:', currentSession)
      
    } catch (error) {
      setMessage(`Error: ${error}`)
    }
  }

  const checkSession = async () => {
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    console.log('Current session:', session)
    setSession(session)
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    setSession(null)
    setMessage('Signed out')
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
      
      <div className="max-w-md space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-white text-white"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-white text-white"
        />
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Login
        </button>
        
        <button
          onClick={checkSession}
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Check Session
        </button>
        
        <button
          onClick={signOut}
          className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Sign Out
        </button>
        
        {message && (
          <p className="text-yellow-400">{message}</p>
        )}
        
        {session && (
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="font-bold">Session Info:</h3>
            <p>User: {session.user.email}</p>
            <p>Access Token: {session.access_token ? 'Present' : 'Missing'}</p>
            <p>Refresh Token: {session.refresh_token ? 'Present' : 'Missing'}</p>
          </div>
        )}
      </div>
    </div>
  )
} 