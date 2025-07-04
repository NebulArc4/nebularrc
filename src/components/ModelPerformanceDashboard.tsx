'use client'

import { useState, useEffect } from 'react'
import { modelManager, AIModel, ModelPerformance } from '@/lib/model-manager'
import useSWR from 'swr'
import toast from 'react-hot-toast'

export default function ModelPerformanceDashboard() {
  const { data: models = [], error: modelsError, isLoading: modelsLoading } = useSWR('/api/models')
  const { data: performanceData = [], error: perfError, isLoading: perfLoading } = useSWR('/api/models/performance')

  useEffect(() => {
    if (modelsError || perfError) toast.error('Error loading model data')
  }, [modelsError, perfError])

  const getModelPerformance = (modelId: string) => {
    return performanceData.find((p: any) => p.modelId === modelId)
  }

  const getTopPerformingModels = () => {
    return models.slice(0, 3)
  }

  const formatResponseTime = (time: number) => {
    if (time < 1000) return `${time}ms`
    return `${(time / 1000).toFixed(1)}s`
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-400'
    if (rate >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'slow': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (modelsLoading || perfLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">AI Model Performance</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live Data</span>
        </div>
      </div>

      {/* Top Performing Models */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Top Performing Models</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getTopPerformingModels().map((model: AIModel, index: number) => {
            const perf = getModelPerformance(model.id)
            return (
              <div key={model.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">{model.name}</h4>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                {perf && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className={getSuccessRateColor(perf.successRate)}>
                        {(perf.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Avg Time:</span>
                      <span className="text-gray-300">{formatResponseTime(perf.averageResponseTime)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Requests:</span>
                      <span className="text-gray-300">{perf.totalRequests}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* All Models Performance */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">All Models</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400 font-medium">Model</th>
                <th className="text-left py-2 text-gray-400 font-medium">Provider</th>
                <th className="text-left py-2 text-gray-400 font-medium">Quality</th>
                <th className="text-left py-2 text-gray-400 font-medium">Speed</th>
                <th className="text-left py-2 text-gray-400 font-medium">Success Rate</th>
                <th className="text-left py-2 text-gray-400 font-medium">Avg Time</th>
                <th className="text-left py-2 text-gray-400 font-medium">Requests</th>
                <th className="text-left py-2 text-gray-400 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model: AIModel) => {
                const perf = getModelPerformance(model.id)
                return (
                  <tr key={model.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 text-white font-medium">{model.name}</td>
                    <td className="py-3 text-gray-300 capitalize">{model.provider}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getQualityColor(model.quality)}`}>
                        {model.quality}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSpeedColor(model.speed)}`}>
                        {model.speed}
                      </span>
                    </td>
                    <td className="py-3">
                      {perf ? (
                        <span className={getSuccessRateColor(perf.successRate)}>
                          {(perf.successRate * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-300">
                      {perf ? formatResponseTime(perf.averageResponseTime) : '-'}
                    </td>
                    <td className="py-3 text-gray-300">
                      {perf ? perf.totalRequests : '0'}
                    </td>
                    <td className="py-3 text-gray-300">
                      {model.costPerToken === 0 ? 'Free' : `$${model.costPerToken}/token`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Recommendations */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Model Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">For Quick Tasks (Low Complexity)</h4>
            <div className="space-y-1">
              {modelManager.getModelRecommendations('quick', 'low').map((model: AIModel) => (
                <div key={model.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{model.name}</span>
                  <span className="text-green-400">Fast & Free</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">For Complex Analysis (High Complexity)</h4>
            <div className="space-y-1">
              {modelManager.getModelRecommendations('analysis', 'high').map((model: AIModel) => (
                <div key={model.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{model.name}</span>
                  <span className="text-blue-400">High Quality</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 