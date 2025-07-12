'use client'

import { useState } from 'react'
import { Bot, TrendingUp, BarChart3, Lightbulb, Send, Sparkles, Zap, Target } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Insight {
  id: string
  type: 'trend' | 'analysis' | 'recommendation'
  title: string
  content: string
  confidence: number
}

export default function AdvancedAIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      }

      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'text-delta' && parsed.textDelta) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: msg.content + parsed.textDelta }
                      : msg
                  )
                )
              }
            } catch {
              // Ignore parsing errors for streaming
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in chat:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const generateInsights = async () => {
    setIsAnalyzing(true)
    
    // Simulate generating insights based on current data
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'trend',
        title: 'Performance Trend',
        content: 'Your system performance has improved by 15% over the last week.',
        confidence: 0.92
      },
      {
        id: '2',
        type: 'analysis',
        title: 'Resource Usage',
        content: 'CPU usage is optimal, but memory consumption could be optimized.',
        confidence: 0.87
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Optimization Suggestion',
        content: 'Consider implementing caching to reduce response times by 20%.',
        confidence: 0.95
      }
    ]
    
    setTimeout(() => {
      setInsights(mockInsights)
      setIsAnalyzing(false)
    }, 2000)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'analysis':
        return <BarChart3 className="h-5 w-5 text-blue-500" />
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
      default:
        return <Bot className="h-5 w-5 text-gray-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800'
      case 'analysis':
        return 'from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800'
      case 'recommendation':
        return 'from-yellow-500/10 to-orange-500/10 border-yellow-200 dark:border-yellow-800'
      default:
        return 'from-gray-500/10 to-slate-500/10 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* AI Chat Section */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            AI Analysis Assistant
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Ask questions and get real-time AI insights with structured responses
          </p>
        </div>
        
        <div className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Start Your AI Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Ask questions about investments, decisions, or any topic to get AI-powered insights with precise calculations.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <div className="h-5 w-5 text-white font-semibold">U</div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask for insights or analysis (e.g., 'I want to make 50 INR profit by investing 1000 INR...')"
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all duration-200"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Insights Generation */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                AI-Generated Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get automated insights and recommendations based on your data
              </p>
            </div>
            <button
              onClick={generateInsights}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all duration-200"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Insights
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Insights Generated Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Click the button above to generate AI-powered insights based on your data and interactions.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-6 rounded-xl border bg-gradient-to-br ${getInsightColor(insight.type)} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${insight.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insight.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 