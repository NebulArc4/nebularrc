import React from 'react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: ['Unlimited tasks', 'PDF upload', 'Basic AI agents', 'Community support'],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$19/mo',
    features: ['Everything in Free', 'Priority AI models', 'Advanced analytics', 'Integrations', 'Email support'],
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Contact us',
    features: ['Custom integrations', 'Dedicated support', 'SLAs', 'On-premise options'],
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23233a] py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-4">Pricing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Simple, transparent pricing for every team.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className={`card flex flex-col items-center bg-white/60 dark:bg-[#23233a]/60 backdrop-blur-xl border border-[#e5e7eb]/60 dark:border-[#23233a]/60 ${plan.highlight ? 'ring-4 ring-[#6366f1]/30 scale-105' : ''}`}>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
            <div className="text-4xl font-extrabold mb-4 text-[#6366f1]">{plan.price}</div>
            <ul className="mb-6 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="text-gray-600 dark:text-gray-300 flex items-center"><svg className="w-4 h-4 mr-2 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>{f}</li>
              ))}
            </ul>
            <a href="/dashboard" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold text-lg shadow-lg hover:from-[#6366f1] hover:to-[#6366f1] transition-all">{plan.highlight ? 'Get Started' : 'Contact Sales'}</a>
          </div>
        ))}
      </div>
    </div>
  )
} 