import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata = {
  title: 'NebulArc',
  description: 'Autonomous AI Operating System',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

