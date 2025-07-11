export interface AIModel {
  id: string
  name: string
  provider: 'groq'
  description: string
  maxTokens: number
  costPerToken: number
  speed: 'fast' | 'medium' | 'slow'
  quality: 'high'
  bestFor: string[]
  isAvailable: boolean
}

export interface ModelPerformance {
  modelId: string
  successRate: number
  averageResponseTime: number
  totalRequests: number
  lastUsed: Date
}

export const availableModels: AIModel[] = [
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3.1 8B',
    provider: 'groq',
    description: 'Fast and efficient Llama 3.1 8B model via Groq',
    maxTokens: 8192,
    costPerToken: 0.00000005, // $0.05 per 1M tokens
    speed: 'fast',
    quality: 'high',
    bestFor: ['analysis', 'creative', 'strategy', 'technical', 'research'],
    isAvailable: true
  },
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    description: 'High-performance Llama 3.1 70B model via Groq',
    maxTokens: 8192,
    costPerToken: 0.00000059, // $0.59 per 1M tokens
    speed: 'fast',
    quality: 'high',
    bestFor: ['analysis', 'creative', 'strategy', 'technical', 'research'],
    isAvailable: true
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    description: 'Powerful Mixtral 8x7B model via Groq',
    maxTokens: 32768,
    costPerToken: 0.00000014, // $0.14 per 1M tokens
    speed: 'fast',
    quality: 'high',
    bestFor: ['analysis', 'creative', 'strategy', 'technical', 'research'],
    isAvailable: true
  }
]

export class ModelManager {
  private static instance: ModelManager
  private performanceData: Map<string, ModelPerformance> = new Map()

  private constructor() {
    this.initializePerformanceData()
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager()
    }
    return ModelManager.instance
  }

  private initializePerformanceData() {
    availableModels.forEach(model => {
      this.performanceData.set(model.id, {
        modelId: model.id,
        successRate: 0.95, // Default success rate
        averageResponseTime: 2000, // Default 2 seconds
        totalRequests: 0,
        lastUsed: new Date()
      })
    })
  }

  getAvailableModels(): AIModel[] {
    return availableModels.filter(model => model.isAvailable)
  }

  getModelById(id: string): AIModel | undefined {
    return availableModels.find(model => model.id === id)
  }

  getModelsByProvider(provider: string): AIModel[] {
    return availableModels.filter(model => model.provider === provider)
  }

  getModelsByQuality(quality: string): AIModel[] {
    return availableModels.filter(model => model.quality === quality)
  }

  getModelsBySpeed(speed: string): AIModel[] {
    return availableModels.filter(model => model.speed === speed)
  }

  getBestModelForTask(complexity: 'low' | 'medium' | 'high'): AIModel {
    const available = this.getAvailableModels()
    
    // Filter by complexity
    let filtered = available
    if (complexity === 'low') {
      filtered = filtered.filter(model => model.speed === 'fast')
    } else if (complexity === 'high') {
      filtered = filtered.filter(model => model.quality === 'high')
    }

    // Sort by performance and cost
    filtered.sort((a, b) => {
      const perfA = this.performanceData.get(a.id)
      const perfB = this.performanceData.get(b.id)
      
      if (!perfA || !perfB) return 0
      
      // Prioritize success rate, then speed, then cost
      const scoreA = perfA.successRate * 0.5 + (1 / perfA.averageResponseTime) * 0.3 + (1 / a.costPerToken) * 0.2
      const scoreB = perfB.successRate * 0.5 + (1 / perfB.averageResponseTime) * 0.3 + (1 / b.costPerToken) * 0.2
      
      return scoreB - scoreA
    })

    return filtered[0] || available[0]
  }

  updateModelPerformance(modelId: string, success: boolean, responseTime: number) {
    const performance = this.performanceData.get(modelId)
    if (!performance) return

    // Update success rate
    const totalRequests = performance.totalRequests + 1
    const successCount = Math.floor(performance.successRate * performance.totalRequests) + (success ? 1 : 0)
    const newSuccessRate = successCount / totalRequests

    // Update average response time
    const totalTime = performance.averageResponseTime * performance.totalRequests + responseTime
    const newAverageTime = totalTime / totalRequests

    this.performanceData.set(modelId, {
      ...performance,
      successRate: newSuccessRate,
      averageResponseTime: newAverageTime,
      totalRequests,
      lastUsed: new Date()
    })
  }

  getModelPerformance(modelId: string): ModelPerformance | undefined {
    return this.performanceData.get(modelId)
  }

  getAllPerformanceData(): ModelPerformance[] {
    return Array.from(this.performanceData.values())
  }

  getTopPerformingModels(limit: number = 5): AIModel[] {
    const performance = this.getAllPerformanceData()
    performance.sort((a, b) => b.successRate - a.successRate)
    
    return performance
      .slice(0, limit)
      .map(p => this.getModelById(p.modelId))
      .filter((model): model is AIModel => model !== undefined)
  }

  setModelAvailability(modelId: string, isAvailable: boolean) {
    const model = this.getModelById(modelId)
    if (model) {
      model.isAvailable = isAvailable
    }
  }

  getModelRecommendations(taskType: string, complexity: 'low' | 'medium' | 'high'): AIModel[] {
    const available = this.getAvailableModels()
    
    // Score models based on task requirements
    const scoredModels = available.map(model => {
      let score = 0
      
      // Quality score
      if (complexity === 'high' && model.quality === 'high') score += 3
      else if (complexity === 'medium' && model.quality === 'high') score += 2
      else if (complexity === 'low' && model.speed === 'fast') score += 2
      
      // Speed score
      if (model.speed === 'fast') score += 1
      
      // Cost score
      if (model.costPerToken === 0) score += 2
      else if (model.costPerToken < 0.0001) score += 1
      
      // Performance score
      const performance = this.getModelPerformance(model.id)
      if (performance) {
        score += performance.successRate * 2
      }
      
      return { model, score }
    })
    
    return scoredModels
      .sort((a, b) => b.score - a.score)
      .map(item => item.model)
      .slice(0, 3) // Return top 3 recommendations
  }
}

export const modelManager = ModelManager.getInstance() 