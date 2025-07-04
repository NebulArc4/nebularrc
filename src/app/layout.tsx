import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import SWRProvider from './SWRProvider'
import { Toaster } from 'react-hot-toast'
import SettingsButton from '@/components/SettingsButton'
import { PreferencesProvider } from '@/components/PreferencesContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NebulArc - AI Operating System',
  description: 'Your personal AI operating system for task automation and intelligent workflows.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <PreferencesProvider>
          <SWRProvider>
            <ThemeProvider>
              <AuthProvider>
                <SettingsButton />
                {children}
              </AuthProvider>
            </ThemeProvider>
          </SWRProvider>
        </PreferencesProvider>
      </body>
    </html>
  )
}

