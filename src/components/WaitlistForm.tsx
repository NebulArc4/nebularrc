'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
  
    const { error: insertError } = await supabaseBrowser.from('waitlist').insert({ email })
  
    if (insertError) {
      console.error(insertError)
      setError('Submission failed. Try again.')
      return
    }
  
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
  
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Email send failed')
  
      setSubmitted(true)
      setEmail('')
    } catch (err) {
      console.error(err)
      setError('Email could not be sent, but you are added to the waitlist.')
    }
  }
  

  return (
    <>
      {!submitted ? (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md px-4 py-3 text-black w-72 sm:w-96 border border-white placeholder-gray-500"
          />
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-900 text-white font-semibold py-3 px-6 rounded-xl text-lg transition-colors"
          >
            Join the Waitlist
          </button>
        </div>
      ) : (
        <p className="text-green-400 mt-4 text-lg font-medium">
          ✅ You're on the waitlist!
        </p>
      )}
      {error && <p className="text-red-400 mt-3">{error}</p>}
    </>
  )
}
