import { HfInference } from '@huggingface/inference'
import { mockAIService } from './mock-ai-service'

// Initialize AI clients
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export interface AITaskRequest {
  taskId: string
  prompt: string
  userId: string
  model?: string
  provider?: 'openai' | 'anthropic' | 'google' | 'huggingface' | 'mock'
}

export interface AITaskResponse {
  taskId: string
  result: string
  status: 'completed' | 'failed'
  error?: string
  model: string
  provider: string
  tokensUsed?: number
}

export class AIService {
  private static instance: AIService
  private providers: {
    openai: boolean
    anthropic: boolean
    google: boolean
    huggingface: boolean
  } = {
    openai: false,
    anthropic: false,
    google: false,
    huggingface: false
  }

  private constructor() {
    this.checkProviderAvailability()
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  private async checkProviderAvailability() {
    // Check OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = true
      console.log('✅ OpenAI API available')
    }

    // Check Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.anthropic = true
      console.log('✅ Anthropic API available')
    }

    // Check Google
    if (process.env.GOOGLE_AI_API_KEY) {
      this.providers.google = true
      console.log('✅ Google AI API available')
    }

    // Check Hugging Face
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        await hf.textGeneration({
          model: 'deepseek-ai/DeepSeek-R1-0528',
          inputs: 'test',
          parameters: { max_new_tokens: 1, return_full_text: false }
        })
        this.providers.huggingface = true
        console.log('✅ Hugging Face API available')
      } catch (error) {
        console.log('❌ Hugging Face API not available:', error)
      }
    }

    console.log('Available AI providers:', this.providers)
  }

  async processTask(request: AITaskRequest): Promise<AITaskResponse> {
    const provider = request.provider || this.getBestProvider(request.prompt)
    
    console.log(`Processing task ${request.taskId} with provider: ${provider}`)

    try {
      switch (provider) {
        case 'openai':
          return await this.processWithOpenAI(request)
        case 'anthropic':
          return await this.processWithAnthropic(request)
        case 'google':
          return await this.processWithGoogle(request)
        case 'huggingface':
          return await this.processWithHuggingFace(request)
        case 'mock':
        default:
          return await this.processWithMock(request)
      }
    } catch (error) {
      console.error(`Error with provider ${provider}:`, error)
      // Fallback to next available provider
      return await this.processWithFallback(request, provider)
    }
  }

  private getBestProvider(prompt: string): string {
    // Determine best provider based on prompt content
    const promptLower = prompt.toLowerCase()
    
    // Prioritize Hugging Face since it's already configured
    if (this.providers.huggingface) {
      return 'huggingface'
    }
    
    if (this.providers.openai && (promptLower.includes('analysis') || promptLower.includes('research'))) {
      return 'openai'
    }
    if (this.providers.anthropic && (promptLower.includes('safety') || promptLower.includes('ethical'))) {
      return 'anthropic'
    }
    if (this.providers.google && (promptLower.includes('multimodal') || promptLower.includes('vision'))) {
      return 'google'
    }
    
    // Return first available provider
    if (this.providers.openai) return 'openai'
    if (this.providers.anthropic) return 'anthropic'
    if (this.providers.google) return 'google'
    if (this.providers.huggingface) return 'huggingface'
    
    return 'mock'
  }

  private async processWithOpenAI(request: AITaskRequest): Promise<AITaskResponse> {
    if (!this.providers.openai) {
      throw new Error('OpenAI not available')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are NebulArc, an advanced AI assistant specialized in autonomous decision-making, research, and strategy. Provide comprehensive, well-structured responses that are actionable and insightful. Always maintain a professional tone and focus on delivering value.'
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.choices[0]?.message?.content || 'No response generated'

    return {
      taskId: request.taskId,
      result,
      status: 'completed',
      model: request.model || 'gpt-4',
      provider: 'openai',
      tokensUsed: data.usage?.total_tokens
    }
  }

  private async processWithAnthropic(request: AITaskRequest): Promise<AITaskResponse> {
    if (!this.providers.anthropic) {
      throw new Error('Anthropic not available')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: request.prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.content[0]?.text || 'No response generated'

    return {
      taskId: request.taskId,
      result,
      status: 'completed',
      model: request.model || 'claude-3-sonnet-20240229',
      provider: 'anthropic',
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens
    }
  }

  private async processWithGoogle(request: AITaskRequest): Promise<AITaskResponse> {
    if (!this.providers.google) {
      throw new Error('Google AI not available')
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${request.model || 'gemini-pro'}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: request.prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.candidates[0]?.content?.parts[0]?.text || 'No response generated'

    return {
      taskId: request.taskId,
      result,
      status: 'completed',
      model: request.model || 'gemini-pro',
      provider: 'google',
      tokensUsed: result.length // Approximate
    }
  }

  private async processWithHuggingFace(request: AITaskRequest): Promise<AITaskResponse> {
    if (!this.providers.huggingface) {
      throw new Error('Hugging Face not available')
    }

    // Use DeepSeek-R1-0528 as the default model
    const model = request.model || 'deepseek-ai/DeepSeek-R1-0528'
    
    console.log(`Processing with Hugging Face model: ${model}`)

    try {
      const response = await hf.textGeneration({
        model: model,
        inputs: request.prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false
        }
      })

      const result = response.generated_text || 'No response generated'

      return {
        taskId: request.taskId,
        result,
        status: 'completed',
        model: model,
        provider: 'huggingface',
        tokensUsed: result.length
      }
    } catch (error) {
      console.error(`Hugging Face API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  private async processWithMock(request: AITaskRequest): Promise<AITaskResponse> {
    console.log(`Processing task ${request.taskId} with mock AI`)
    const mockResponse = await mockAIService.processTask(request)
    return {
      ...mockResponse,
      provider: 'mock'
    }
  }

  private async processWithFallback(request: AITaskRequest, failedProvider: string): Promise<AITaskResponse> {
    console.log(`Provider ${failedProvider} failed, trying fallback...`)
    
    // Try other providers in order of preference
    const fallbackOrder = ['openai', 'anthropic', 'google', 'huggingface', 'mock']
    const startIndex = fallbackOrder.indexOf(failedProvider) + 1
    
    for (let i = startIndex; i < fallbackOrder.length; i++) {
      const provider = fallbackOrder[i]
      if (this.providers[provider as keyof typeof this.providers] || provider === 'mock') {
        try {
          console.log(`Trying fallback provider: ${provider}`)
          return await this.processTask({ ...request, provider: provider as any })
        } catch (error) {
          console.error(`Fallback provider ${provider} also failed:`, error)
          continue
        }
      }
    }
    
    // If all providers fail, use mock
    return await this.processWithMock(request)
  }

  async analyzeTask(prompt: string): Promise<{
    category: string
    complexity: 'low' | 'medium' | 'high'
    estimatedTokens: number
    suggestedModel: string
    suggestedProvider: string
  }> {
    try {
      const words = prompt.toLowerCase().split(' ')
      
      // Category detection
      let category = 'other'
      if (words.some(w => ['analyze', 'analysis', 'data', 'trends', 'research'].includes(w))) {
        category = 'analysis'
      } else if (words.some(w => ['create', 'generate', 'write', 'content', 'creative'].includes(w))) {
        category = 'creative'
      } else if (words.some(w => ['strategy', 'plan', 'business', 'marketing'].includes(w))) {
        category = 'strategy'
      } else if (words.some(w => ['code', 'technical', 'programming', 'development'].includes(w))) {
        category = 'technical'
      } else if (words.some(w => ['research', 'study', 'investigate'].includes(w))) {
        category = 'research'
      }

      // Complexity detection
      let complexity: 'low' | 'medium' | 'high' = 'medium'
      const wordCount = words.length
      if (wordCount < 10) {
        complexity = 'low'
      } else if (wordCount > 30) {
        complexity = 'high'
      }

      // Token estimation
      const estimatedTokens = Math.ceil(wordCount * 1.3)

      // Provider and model suggestion
      let suggestedProvider = 'mock'
      let suggestedModel = 'mock-ai-v1'

      if (this.providers.huggingface) {
        suggestedProvider = 'huggingface'
        suggestedModel = 'HuggingFaceH4/zephyr-7b-beta'
      } else if (this.providers.openai) {
        suggestedProvider = 'openai'
        suggestedModel = complexity === 'high' ? 'gpt-4' : 'gpt-3.5-turbo'
      } else if (this.providers.anthropic) {
        suggestedProvider = 'anthropic'
        suggestedModel = 'claude-3-sonnet-20240229'
      } else if (this.providers.google) {
        suggestedProvider = 'google'
        suggestedModel = 'gemini-pro'
      }

      return {
        category,
        complexity,
        estimatedTokens,
        suggestedModel,
        suggestedProvider
      }
    } catch (error) {
      console.error('Error analyzing task:', error)
      return {
        category: 'other',
        complexity: 'medium',
        estimatedTokens: 1000,
        suggestedModel: 'mock-ai-v1',
        suggestedProvider: 'mock'
      }
    }
  }

  getAvailableProviders(): string[] {
    const available = []
    if (this.providers.openai) available.push('openai')
    if (this.providers.anthropic) available.push('anthropic')
    if (this.providers.google) available.push('google')
    if (this.providers.huggingface) available.push('huggingface')
    if (available.length === 0) available.push('mock')
    return available
  }
}

export const aiService = AIService.getInstance() 