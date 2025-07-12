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
    recentActivity: unknown[]
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

export interface AIDecisionSupportRequest {
  userId: string
  decisionPrompt: string
}

export interface AIDecisionSupportResponse {
  options: { option: string; outcome: string; probability?: string }[]
  best: string
  rationale: string
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
      taskType: request.actionType as 'analysis' | 'summarization' | 'translation' | 'code_review' | 'insights' | 'recommendations'
    })
  }

  async generateDecisionSupport(request: AIDecisionSupportRequest): Promise<AIDecisionSupportResponse> {
    const prompt = `A user is facing the following decision:\n"""\n${request.decisionPrompt}\n"""\n\nAs an advanced AI, provide 2-4 possible options the user could take, the probable outcome of each, and which option you recommend as best.\n\nYour response MUST be concise, well-structured, and easy to scan.\n- Present options as a numbered list, each with a one-line outcome and probability.\n- Clearly state the best option.\n- Rationale should be a short summary (max 2 sentences).\n- Do NOT include markdown, explanations, or verbose text.\n\nFormat your response as JSON:\n{\n  "options": [\n    { "option": "...", "outcome": "...", "probability": "(optional)" },\n    ...\n  ],\n  "best": "...",\n  "rationale": "..."\n}`;

    const response = await this.processWithGroq({
      taskId: `decision-${Date.now()}`,
      prompt,
      userId: request.userId,
      taskType: 'analysis'
    })

    // Try to parse the response as JSON
    try {
      const parsed = JSON.parse(response.result)
      return {
        options: parsed.options || [],
        best: parsed.best || '',
        rationale: parsed.rationale || ''
      }
    } catch {
      // Fallback: return the raw result as rationale
      return {
        options: [],
        best: '',
        rationale: response.result
      }
    }
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
      prompt = `Please analyze the following data and provide concise, well-structured insights:\n\n${prompt}\n\nYour response MUST be compact and easy to scan.\n- Use a numbered or bulleted list for findings and recommendations.\n- Limit each point to one sentence.\n- End with a brief summary (max 2 sentences).\n- Do NOT include markdown or verbose explanations.`
    }

    if (request.taskType === 'summarization') {
      prompt = `Please create a concise summary of the following content:\n\n${prompt}\n\nFocus on the main points and key takeaways. Limit your response to 3-5 bullet points and a one-sentence summary. Do NOT include markdown or extra explanation.`
    }

    if (request.taskType === 'code_review') {
      prompt = `Please review the following code and provide feedback:\n\n${prompt}\n\nYour response MUST be short and structured.\n- Use a numbered list for issues and suggestions.\n- Limit each point to one sentence.\n- End with a brief summary.\n- Do NOT include markdown or verbose explanations.`
    }

    return prompt
  }

  private buildInsightsPrompt(userData: AIInsightsRequest['userData']): string {
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

  private parseInsightsResponse(response: string): AIInsightsResponse {
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