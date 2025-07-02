'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role, onboarding_progress')
        .eq('id', user.id)
        .single()
      setProfile(profile)
      setName(profile?.name || '')
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const supabase = createClientComponentClient()
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id)
    setSaving(false)
    if (!error) {
      setToast('Name updated!')
      setProfile((p: any) => ({ ...p, name }))
    } else {
      setToast('Error updating name')
    }
    setTimeout(() => setToast(null), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Link href="/dashboard" className="inline-block mb-4 text-[#6366f1] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>
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
      <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>
      <div className="bg-white/60 dark:bg-[#23233a]/60 rounded-xl p-8 shadow-lg mb-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">{profile?.name || user?.email?.split('@')[0] || 'User'}</div>
            <div className="text-gray-500 dark:text-gray-300 text-sm">{user?.email}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{profile?.role || 'User'}</div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border px-3 py-2 bg-white/80 dark:bg-[#23233a]/80" />
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold shadow-lg hover:from-[#6366f1] hover:to-[#6366f1] transition-all disabled:opacity-50 mb-4">
          {saving ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-2"></span> : null}
          {saving ? 'Saving...' : 'Save'}
        </button>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-200">Theme:</span>
          <ThemeToggle />
        </div>
        {profile?.onboarding_progress && (
          <div className="mt-6">
            <div className="text-xs text-gray-500 mb-1">Onboarding Progress</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] h-2 rounded-full" style={{ width: `${profile.onboarding_progress}%` }}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{profile.onboarding_progress}% complete</div>
          </div>
        )}
        {toast && <div className="mt-4 text-emerald-600 font-semibold">{toast}</div>}
      </div>
    </div>
  )
} 