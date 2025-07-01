export interface AITaskRequest {
  taskId: string
  prompt: string
  userId: string
  model?: string // Only Groq models supported
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
    return await this.processWithGroq(request)
  }

  private async processWithGroq(request: AITaskRequest): Promise<AITaskResponse> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq AI not available')
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'llama3-8b-8192',
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
      throw new Error(`Groq AI API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.choices[0]?.message?.content || 'No response generated'

    return {
      taskId: request.taskId,
      result,
      status: 'completed',
      model: request.model || 'llama3-8b-8192',
      provider: 'groq',
      tokensUsed: data.usage?.total_tokens
    }
  }
}

export const aiService = AIService.getInstance()

export async function runChatCompletion(prompt: string) {
  // ... existing code ...
} 