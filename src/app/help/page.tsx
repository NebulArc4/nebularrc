'use client'

import React, { useState } from 'react'

const faqs = [
  { q: 'How do I upload a PDF?', a: 'Go to the dashboard, use the AI Analysis form, and drag or select your PDF.' },
{ q: 'How do I get AI results as a PDF?', a: 'After running an analysis, use the Download as PDF or Download Annotated PDF buttons.' },
{ q: 'Can I automate analyses with agents?', a: 'Yes! Use the Agent Manager to create and schedule AI agents for recurring analyses.' },
  { q: 'Is my data secure?', a: 'Yes, NebulArc uses secure authentication and encrypted storage for your data.' },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23233a] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Find answers to common questions or contact support below.</p>
      </div>
      <div className="max-w-2xl mx-auto mb-16">
        {faqs.map((faq, i) => (
          <div key={faq.q} className="mb-4">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 rounded-xl bg-white/60 dark:bg-[#23233a]/60 border border-[#e5e7eb]/60 dark:border-[#23233a]/60 font-semibold text-gray-900 dark:text-white flex items-center justify-between focus:outline-none">
              <span>{faq.q}</span>
              <svg className={`w-5 h-5 ml-2 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {open === i && <div className="px-6 py-4 text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-[#23233a]/40 rounded-b-xl border-t border-[#e5e7eb]/60 dark:border-[#23233a]/60 animate-fade-in">{faq.a}</div>}
          </div>
        ))}
      </div>
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Need more help?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Contact our support team at <a href="mailto:support@nebularc.com" className="text-[#6366f1] underline">support@nebularc.com</a></p>
      </div>
    </div>
  )
} 