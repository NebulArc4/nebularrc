export interface AITaskRequest {
  taskId: string
  prompt: string
  userId: string
  model?: string // Only Gemini models supported
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
  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async processTask(request: AITaskRequest): Promise<AITaskResponse> {
    return await this.processWithGoogle(request)
  }

  private async processWithGoogle(request: AITaskRequest): Promise<AITaskResponse> {
    if (!process.env.GOOGLE_AI_API_KEY) {
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
}

export const aiService = AIService.getInstance()

export async function runChatCompletion(prompt: string) {
  // ... existing code ...
} 