// src/app/auth/page.tsx
'use client'

import AuthForm from '@/components/AuthForm'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <AuthForm />
    </div>
  )
}

