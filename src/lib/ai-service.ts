import { HfInference } from '@huggingface/inference'
import { mockAIService } from './mock-ai-service'

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export interface AITaskRequest {
  taskId: string
  prompt: string
  userId: string
  model?: string
}

export interface AITaskResponse {
  taskId: string
  result: string
  status: 'completed' | 'failed'
  error?: string
  model: string
  tokensUsed?: number
}

export class AIService {
  private static instance: AIService
  private hfAvailable: boolean = false

  private constructor() {
    this.checkHFAvailability()
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  private async checkHFAvailability() {
    try {
      // Test with a simple model to check if HF is available
      const response = await hf.textGeneration({
        model: 'distilgpt2',
        inputs: 'test',
        parameters: {
          max_new_tokens: 1,
          return_full_text: false
        }
      })
      this.hfAvailable = true
      console.log('Hugging Face is available')
    } catch (error) {
      this.hfAvailable = false
      console.log('Hugging Face not available, using mock AI:', error)
    }
  }

  async processTask(request: AITaskRequest): Promise<AITaskResponse> {
    // If HF is not available, use mock AI
    if (!this.hfAvailable) {
      console.log(`Processing task ${request.taskId} with mock AI (HF not available)`)
      return await mockAIService.processTask(request)
    }

    try {
      // Use reliable, always-available models
      const model = request.model || 'distilgpt2'
      
      console.log(`Processing task ${request.taskId} with Hugging Face model ${model}`)
      
      // For text generation tasks, we'll use a conversational approach
      const systemPrompt = `You are NebulArc, an advanced AI assistant specialized in autonomous decision-making, research, and strategy. 
      Provide comprehensive, well-structured responses that are actionable and insightful.
      Always maintain a professional tone and focus on delivering value.`
      
      const fullPrompt = `${systemPrompt}\n\nUser: ${request.prompt}\nNebulArc:`
      
      const response = await hf.textGeneration({
        model: model,
        inputs: fullPrompt,
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
        model,
        tokensUsed: result.length // Approximate token count
      }

    } catch (error) {
      console.error(`Error processing task ${request.taskId} with Hugging Face:`, error)
      
      // Try alternative model if first one fails
      try {
        console.log(`Trying alternative Hugging Face model for task ${request.taskId}`)
        return await this.processTaskWithAlternative(request)
      } catch (fallbackError) {
        console.error(`Hugging Face fallback also failed for task ${request.taskId}:`, fallbackError)
        
        // Fall back to mock AI
        console.log(`Falling back to mock AI for task ${request.taskId}`)
        return await mockAIService.processTask(request)
      }
    }
  }

  async analyzeTask(prompt: string): Promise<{
    category: string
    complexity: 'low' | 'medium' | 'high'
    estimatedTokens: number
    suggestedModel: string
  }> {
    try {
      // Simple rule-based analysis since we can't use AI for this
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

      // Model suggestion - use reliable models
      const suggestedModel = this.hfAvailable ? 'distilgpt2' : 'mock-ai-v1'

      return {
        category,
        complexity,
        estimatedTokens,
        suggestedModel
      }
    } catch (error) {
      console.error('Error analyzing task:', error)
      return {
        category: 'other',
        complexity: 'medium',
        estimatedTokens: 1000,
        suggestedModel: this.hfAvailable ? 'distilgpt2' : 'mock-ai-v1'
      }
    }
  }

  // Alternative method using a different free model
  async processTaskWithAlternative(request: AITaskRequest): Promise<AITaskResponse> {
    try {
      // Use a different free model as fallback
      const model = 'gpt2' // Alternative model
      
      console.log(`Processing task ${request.taskId} with alternative Hugging Face model ${model}`)
      
      const response = await hf.textGeneration({
        model: model,
        inputs: request.prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.8,
          do_sample: true,
          return_full_text: false
        }
      })

      const result = response.generated_text || 'No response generated'

      return {
        taskId: request.taskId,
        result,
        status: 'completed',
        model,
        tokensUsed: result.length
      }

    } catch (error) {
      console.error(`Error processing task ${request.taskId} with alternative model:`, error)
      
      return {
        taskId: request.taskId,
        result: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        model: 'gpt2'
      }
    }
  }
}

export const aiService = AIService.getInstance() 