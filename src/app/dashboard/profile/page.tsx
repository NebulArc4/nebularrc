'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useTheme } from '@/components/ThemeProvider'

interface Profile {
  id: string
  name: string
  role: string
  avatar_url?: string
  preferences?: {
    notifications: boolean
    email_updates: boolean
    theme: 'dark' | 'light' | 'auto'
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { theme, toggleTheme } = useTheme()
  
  const supabase = supabaseBrowser

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData || { id: user.id, name: '', role: 'User' })
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleSaveProfile = async () => {
    if (!user || !profile) return
    
    setSaving(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name,
          role: profile.role,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage('Error updating profile')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile & Preferences</h1>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg text-gray-500 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={profile?.role || 'User'}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, role: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#6366f1] focus:border-transparent"
                  >
                    <option value="User">User</option>
                    <option value="Developer">Developer</option>
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 dark:bg-[#6366f1] text-white rounded-lg hover:bg-blue-700 dark:hover:bg-[#5b5beb] disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] p-6">
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                  >
                    {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your tasks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#6366f1] dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-[#6366f1]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] p-6">
              <h2 className="text-xl font-semibold mb-4">Account Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member since</span>
                  <span className="text-gray-900 dark:text-white">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last login</span>
                  <span className="text-gray-900 dark:text-white">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#333] p-6">
              <h2 className="text-xl font-semibold mb-4">API Keys</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Manage your API keys for external integrations
              </p>
              <button className="w-full px-4 py-2 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors">
                Manage API Keys
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-400">Danger Zone</h2>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                These actions cannot be undone
              </p>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 