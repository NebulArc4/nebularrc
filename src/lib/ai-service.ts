export interface AITaskRequest {
  taskId: string
  prompt: string
  userId: string
  model?: string // Only Groq models supported
  context?: string // Additional context for the task
  taskType?: 'analysis' | 'summarization' | 'translation' | 'code_review' | 'insights' | 'recommendations'
}

export interface AITaskResponse {
  taskId: string
  result: string
  status: 'completed' | 'failed'
  error?: string
  model: string
  provider: string
  tokensUsed?: number
  insights?: string[]
  recommendations?: string[]
}

export interface AIInsightsRequest {
  userId: string
  userData: {
    totalTasks: number
    completedTasks: number
    activeAgents: number
    recentActivity: any[]
    taskCategories: string[]
  }
}

export interface AIInsightsResponse {
  insights: string[]
  recommendations: string[]
  productivityTips: string[]
  usageAnalysis: string
}

export interface AIQuickActionRequest {
  actionType: 'analyze' | 'summarize' | 'translate' | 'code_review'
  content: string
  userId: string
  context?: string
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

  async generateInsights(request: AIInsightsRequest): Promise<AIInsightsResponse> {
    const prompt = this.buildInsightsPrompt(request.userData)
    
    const response = await this.processWithGroq({
      taskId: `insights-${Date.now()}`,
      prompt,
      userId: request.userId,
      taskType: 'insights'
    })

    // Parse the response to extract insights, recommendations, etc.
    const parsed = this.parseInsightsResponse(response.result)
    
    return {
      insights: parsed.insights,
      recommendations: parsed.recommendations,
      productivityTips: parsed.productivityTips,
      usageAnalysis: parsed.usageAnalysis
    }
  }

  async processQuickAction(request: AIQuickActionRequest): Promise<AITaskResponse> {
    const prompt = this.buildQuickActionPrompt(request)
    
    return await this.processWithGroq({
      taskId: `quick-${Date.now()}`,
      prompt,
      userId: request.userId,
      taskType: request.actionType as any
    })
  }

  private async processWithGroq(request: AITaskRequest): Promise<AITaskResponse> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq AI not available')
    }

    const systemPrompt = this.getSystemPrompt(request.taskType)
    const userPrompt = this.buildUserPrompt(request)

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 3000,
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

  private getSystemPrompt(taskType?: string): string {
    const basePrompt = 'You are NebulArc, an advanced AI assistant specialized in autonomous decision-making, research, and strategy. Provide comprehensive, well-structured responses that are actionable and insightful. Always maintain a professional tone and focus on delivering value.'

    switch (taskType) {
      case 'analysis':
        return `${basePrompt} You are particularly skilled at data analysis. Provide detailed insights, identify patterns, and offer actionable recommendations based on the data provided.`
      
      case 'summarization':
        return `${basePrompt} You excel at creating concise, accurate summaries. Focus on key points, maintain context, and ensure the summary is easily digestible.`
      
      case 'translation':
        return `${basePrompt} You are a skilled translator. Provide accurate translations while preserving the original meaning, tone, and context.`
      
      case 'code_review':
        return `${basePrompt} You are an expert code reviewer. Analyze code for best practices, security issues, performance improvements, and provide specific, actionable feedback.`
      
      case 'insights':
        return `${basePrompt} You are an expert at analyzing user behavior and productivity patterns. Provide personalized insights and recommendations to improve workflow efficiency.`
      
      case 'recommendations':
        return `${basePrompt} You are skilled at providing personalized recommendations based on user data and preferences. Focus on actionable, specific suggestions.`
      
      default:
        return basePrompt
    }
  }

  private buildUserPrompt(request: AITaskRequest): string {
    let prompt = request.prompt

    if (request.context) {
      prompt = `Context: ${request.context}\n\nTask: ${prompt}`
    }

    if (request.taskType === 'analysis') {
      prompt = `Please analyze the following data and provide comprehensive insights:\n\n${prompt}\n\nPlease structure your response with:\n1. Key Findings\n2. Patterns Identified\n3. Recommendations\n4. Action Items`
    }

    if (request.taskType === 'summarization') {
      prompt = `Please create a concise summary of the following content:\n\n${prompt}\n\nFocus on the main points and key takeaways.`
    }

    if (request.taskType === 'code_review') {
      prompt = `Please review the following code and provide feedback:\n\n${prompt}\n\nPlease structure your response with:\n1. Code Quality Assessment\n2. Security Considerations\n3. Performance Optimizations\n4. Best Practices Recommendations\n5. Specific Improvements`
    }

    return prompt
  }

  private buildInsightsPrompt(userData: any): string {
    return `Based on the following user data, provide personalized insights and recommendations:

User Activity Summary:
- Total Tasks: ${userData.totalTasks}
- Completed Tasks: ${userData.completedTasks}
- Active Agents: ${userData.activeAgents}
- Task Categories: ${userData.taskCategories.join(', ')}

Recent Activity: ${JSON.stringify(userData.recentActivity, null, 2)}

Please provide:
1. 3-5 personalized insights about their usage patterns
2. 3-5 actionable recommendations for improvement
3. 3 productivity tips
4. A brief usage analysis

Format your response as JSON with the following structure:
{
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "productivityTips": ["tip1", "tip2", "tip3"],
  "usageAnalysis": "brief analysis text"
}`
  }

  private buildQuickActionPrompt(request: AIQuickActionRequest): string {
    const actionPrompts = {
      analyze: `Please analyze the following data and provide insights:\n\n${request.content}\n\nProvide a structured analysis with key findings and recommendations.`,
      summarize: `Please create a concise summary of the following content:\n\n${request.content}\n\nFocus on the main points and key takeaways.`,
      translate: `Please translate the following text to English:\n\n${request.content}\n\nMaintain the original meaning and tone.`,
      code_review: `Please review the following code:\n\n${request.content}\n\nProvide feedback on code quality, security, performance, and best practices.`
    }

    return actionPrompts[request.actionType] || request.content
  }

  private parseInsightsResponse(response: string): any {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse insights response as JSON:', error)
    }

    // Fallback parsing for non-JSON responses
    const insights = response.match(/insights?[:\s]+(.*?)(?=\n|$)/gi)?.map(s => s.replace(/insights?[:\s]+/i, '').trim()) || []
    const recommendations = response.match(/recommendations?[:\s]+(.*?)(?=\n|$)/gi)?.map(s => s.replace(/recommendations?[:\s]+/i, '').trim()) || []
    const productivityTips = response.match(/tips?[:\s]+(.*?)(?=\n|$)/gi)?.map(s => s.replace(/tips?[:\s]+/i, '').trim()) || []
    const usageAnalysis = response.match(/analysis[:\s]+(.*?)(?=\n|$)/i)?.[1]?.trim() || ''

    return {
      insights: insights.slice(0, 5),
      recommendations: recommendations.slice(0, 5),
      productivityTips: productivityTips.slice(0, 3),
      usageAnalysis
    }
  }
}

export const aiService = AIService.getInstance()

export async function runChatCompletion(prompt: string) {
  return await aiService.processTask({
    taskId: `chat-${Date.now()}`,
    prompt,
    userId: 'system'
  })
} 