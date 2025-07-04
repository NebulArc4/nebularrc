"use client"

import { useState } from 'react'
import StockPriceChart from '@/components/StockPriceChart'

export default function AIDecisionSupportPage() {
  const [decisionPrompt, setDecisionPrompt] = useState('')
  const [decisionResult, setDecisionResult] = useState<any>(null)
  const [decisionLoading, setDecisionLoading] = useState(false)
  const [decisionError, setDecisionError] = useState<string | null>(null)

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDecisionLoading(true)
    setDecisionError(null)
    setDecisionResult(null)
    try {
      const response = await fetch('/api/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'decision_support', content: decisionPrompt })
      })
      const data = await response.json()
      if (data.success) {
        setDecisionResult(data)
      } else {
        setDecisionError(data.error || 'AI could not process your request.')
      }
    } catch (err) {
      setDecisionError('Failed to get AI decision support.')
    } finally {
      setDecisionLoading(false)
    }
  }

  // Helper to extract stock symbol from decisionPrompt or decisionResult
  function extractStockSymbol(text: string): string | null {
    // Simple regex: 1-5 uppercase letters, not a common word
    const match = text.match(/\b[A-Z]{1,5}\b/g);
    if (!match) return null;
    // Optionally filter out common English words
    const blacklist = ['THE', 'AND', 'FOR', 'WITH', 'FROM', 'THIS', 'THAT', 'YOUR', 'HAVE', 'WILL', 'SHOULD', 'COULD', 'MIGHT', 'ABOUT', 'WHICH', 'THERE', 'THEIR', 'WHAT', 'WHEN', 'WHERE', 'WHO', 'WHY', 'HOW'];
    const symbol = match.find(s => !blacklist.includes(s));
    return symbol || null;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">AI Decision Support</h1>
      <form onSubmit={handleDecisionSubmit} className="flex flex-col gap-4 mb-4">
        <textarea
          className="w-full px-4 py-3 rounded border border-gray-300 dark:border-[#444] bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6366f1]"
          rows={4}
          placeholder="Describe your decision or dilemma (e.g. Should I hire candidate A or B? Should I invest in X or Y?)"
          value={decisionPrompt}
          onChange={e => setDecisionPrompt(e.target.value)}
          required
        />
        <button
          type="submit"
          className="self-end bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200 disabled:opacity-60"
          disabled={decisionLoading || !decisionPrompt.trim()}
        >
          {decisionLoading ? 'Thinking...' : 'Ask AI for Decision Options'}
        </button>
      </form>
      {decisionError && <div className="text-red-500 text-sm mb-4">{decisionError}</div>}
      {decisionResult && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20 p-6">
          <h2 className="font-semibold mb-2 text-lg text-gray-900 dark:text-white">AI Decision Options & Outcomes</h2>
          <ul className="space-y-3 mb-3">
            {decisionResult.options && decisionResult.options.map((opt: any, idx: number) => (
              <li key={idx} className="p-3 rounded border border-gray-200 dark:border-[#444] bg-gray-50 dark:bg-[#232336]">
                <span className="font-medium">Option:</span> {opt.option}<br />
                <span className="font-medium">Outcome:</span> {opt.outcome}
                {opt.probability && <><br /><span className="font-medium">Probability:</span> {opt.probability}</>}
              </li>
            ))}
          </ul>
          <div className="p-3 rounded border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10 mb-2">
            <span className="font-semibold text-green-700 dark:text-green-400">Best Option:</span> {decisionResult.best}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Rationale:</span> {decisionResult.rationale}</div>
          {/* Auto-detect stock symbol and show chart if found */}
          {(() => {
            const text = decisionPrompt + ' ' + JSON.stringify(decisionResult);
            const symbol = extractStockSymbol(text);
            if (!symbol) return null;
            return (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Stock Price Chart for {symbol}</h3>
                <StockPriceChart symbol={symbol} />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  )
} 