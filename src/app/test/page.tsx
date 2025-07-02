'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function TestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [session, setSession] = useState<any>(null)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] text-gray-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Authentication Test</h1>
        
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-xl">
          <div className="max-w-md space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </button>
            
            <button
              onClick={checkSession}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Check Session
            </button>
            
            <button
              onClick={signOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
            
            {message && (
              <p className="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 py-2">{message}</p>
            )}
            
            {session && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">Session Info:</h3>
                <p className="text-gray-700 dark:text-gray-300">User: {session.user.email}</p>
                <p className="text-gray-700 dark:text-gray-300">Access Token: {session.access_token ? 'Present' : 'Missing'}</p>
                <p className="text-gray-700 dark:text-gray-300">Refresh Token: {session.refresh_token ? 'Present' : 'Missing'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 