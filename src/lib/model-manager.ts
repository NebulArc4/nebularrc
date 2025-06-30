export interface AIModel {
  id: string
  name: string
  provider: 'huggingface' | 'mock' | 'openai' | 'anthropic'
  description: string
  maxTokens: number
  costPerToken: number
  speed: 'fast' | 'medium' | 'slow'
  quality: 'low' | 'medium' | 'high'
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
  // Hugging Face Models
  {
    id: 'gpt2',
    name: 'GPT-2',
    provider: 'huggingface',
    description: 'OpenAI\'s GPT-2 model for text generation',
    maxTokens: 1024,
    costPerToken: 0.0001,
    speed: 'fast',
    quality: 'medium',
    bestFor: ['text-generation', 'summarization', 'creative-writing'],
    isAvailable: true
  },
  {
    id: 'distilgpt2',
    name: 'DistilGPT-2',
    provider: 'huggingface',
    description: 'Distilled version of GPT-2, faster and lighter',
    maxTokens: 1024,
    costPerToken: 0.00005,
    speed: 'fast',
    quality: 'medium',
    bestFor: ['text-generation', 'quick-responses', 'summarization'],
    isAvailable: true
  },
  {
    id: 'microsoft/DialoGPT-medium',
    name: 'DialoGPT Medium',
    provider: 'huggingface',
    description: 'Conversational AI model for dialogue generation',
    maxTokens: 1024,
    costPerToken: 0.0001,
    speed: 'medium',
    quality: 'high',
    bestFor: ['conversation', 'chat', 'interactive-tasks'],
    isAvailable: false // Will be checked dynamically
  },
  {
    id: 'microsoft/DialoGPT-large',
    name: 'DialoGPT Large',
    provider: 'huggingface',
    description: 'Large conversational AI model for complex dialogues',
    maxTokens: 2048,
    costPerToken: 0.0002,
    speed: 'slow',
    quality: 'high',
    bestFor: ['complex-conversation', 'detailed-analysis', 'creative-writing'],
    isAvailable: false
  },

  // Mock AI Model
  {
    id: 'mock-ai-v1',
    name: 'Mock AI v1',
    provider: 'mock',
    description: 'Local mock AI for testing and development',
    maxTokens: 1000,
    costPerToken: 0,
    speed: 'fast',
    quality: 'medium',
    bestFor: ['testing', 'development', 'prototyping'],
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

  getBestModelForTask(complexity: 'low' | 'medium' | 'high', category: string): AIModel {
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
      else if (complexity === 'medium' && model.quality === 'medium') score += 2
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