'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove('page-fade-active')
    el.classList.add('page-fade')
    setTimeout(() => {
      el.classList.add('page-fade-active')
    }, 10)
  }, [pathname])
  return (
    <main ref={ref} className="flex-1 p-8 bg-transparent page-fade page-fade-active">
      {children}
    </main>
  )
} 