import React, { useEffect } from 'react'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const color =
    type === 'success' ? 'bg-emerald-500' :
    type === 'error' ? 'bg-red-500' :
    'bg-blue-500'

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg text-white font-semibold ${color} animate-fade-in`}
      role="status"
      aria-live="polite"
    >
      {message}
      <button
        onClick={onClose}
        className="ml-4 text-white/70 hover:text-white text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  )
} 