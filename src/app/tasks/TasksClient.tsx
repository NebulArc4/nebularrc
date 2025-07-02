'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TaskSubmissionForm from '@/components/TaskSubmissionForm'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const TaskList = dynamic(() => import('@/components/TaskList'), { ssr: false })

export default function TasksClient() {
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 relative">
        <Link href="/dashboard" className="inline-block mb-4 text-[#6366f1] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-6">Your AI Tasks</h1>
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
    <div className="max-w-5xl mx-auto py-8 relative">
      <Link href="/dashboard" className="inline-block mb-4 text-[#6366f1] hover:underline">← Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-6">Your AI Tasks</h1>
      <div className="animate-fade-in">
        <TaskList userId={user.id} />
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-110 transition-all"
        title="New Task"
        aria-label="Create new task"
      >
        +
      </button>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit New Task">
        <TaskSubmissionForm user={user} onSuccess={() => { setShowModal(false); setToast({ message: 'Task submitted!', type: 'success' }) }} />
      </Modal>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
} 