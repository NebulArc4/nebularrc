import { getSupabaseServer } from './supabase-server'
import { aiService } from './ai-service'

export interface Agent {
  id: string
  user_id: string
  name: string
  description: string
  task_prompt: string
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
  custom_schedule?: string // Cron expression for custom schedules
  is_active: boolean
  last_run?: string
  next_run?: string
  total_runs: number
  created_at: string
  updated_at: string
  category: string
  model: string
  complexity: 'low' | 'medium' | 'high'
}

export interface AgentRun {
  id: string
  agent_id: string
  user_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
  error_message?: string
  started_at: string
  completed_at?: string
  tokens_used?: number
  model_used?: string
}

export class AgentService {
  private get supabase() {
    return getSupabaseServer()
  }

  async createAgent(userId: string, agentData: Omit<Agent, 'id' | 'user_id' | 'total_runs' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const nextRun = this.calculateNextRun(agentData.schedule, agentData.custom_schedule)
    
    const { data: agent, error } = await this.supabase
      .from('agents')
      .insert({
        user_id: userId,
        ...agentData,
        total_runs: 0,
        next_run: nextRun,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating agent:', error)
      throw new Error('Failed to create agent')
    }

    return agent
  }

  async getAgents(userId: string): Promise<Agent[]> {
    const { data: agents, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agents:', error)
      throw new Error('Failed to fetch agents')
    }

    return agents || []
  }

  async getAgent(agentId: string, userId: string): Promise<Agent | null> {
    const { data: agent, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching agent:', error)
      return null
    }

    return agent
  }

  async updateAgent(agentId: string, userId: string, updates: Partial<Agent>): Promise<Agent> {
    const nextRun = updates.schedule ? this.calculateNextRun(updates.schedule, updates.custom_schedule) : undefined
    
    const { data: agent, error } = await this.supabase
      .from('agents')
      .update({
        ...updates,
        next_run: nextRun,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating agent:', error)
      throw new Error('Failed to update agent')
    }

    return agent
  }

  async deleteAgent(agentId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('agents')
      .delete()
      .eq('id', agentId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting agent:', error)
      throw new Error('Failed to delete agent')
    }
  }

  async toggleAgent(agentId: string, userId: string, isActive: boolean): Promise<Agent> {
    return this.updateAgent(agentId, userId, { is_active: isActive })
  }

  async getAgentRuns(agentId: string, userId: string, limit: number = 10): Promise<AgentRun[]> {
    const { data: runs, error } = await this.supabase
      .from('agent_runs')
      .select('*')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching agent runs:', error)
      throw new Error('Failed to fetch agent runs')
    }

    return runs || []
  }

  async runAgent(agentId: string, userId: string): Promise<AgentRun> {
    const agent = await this.getAgent(agentId, userId)
    if (!agent) {
      throw new Error('Agent not found')
    }

    if (!agent.is_active) {
      throw new Error('Agent is not active')
    }

    // Create agent run record
    const { data: run, error: runError } = await this.supabase
      .from('agent_runs')
      .insert({
        agent_id: agentId,
        user_id: userId,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (runError) {
      console.error('Error creating agent run:', runError)
      throw new Error('Failed to create agent run')
    }

    try {
      // Execute the agent task using Groq AI
      const aiResponse = await this.executeAgentTask(agent, run.id, userId)

      // Update run with result
      const updateData: any = {
        status: aiResponse.status === 'completed' ? 'completed' : 'failed',
        completed_at: new Date().toISOString()
      }

      if (aiResponse.status === 'completed') {
        updateData.result = aiResponse.result
        updateData.model_used = aiResponse.model
        updateData.tokens_used = aiResponse.tokensUsed
      } else {
        updateData.error_message = aiResponse.error
      }

      await this.supabase
        .from('agent_runs')
        .update(updateData)
        .eq('id', run.id)

      // Update agent stats
      await this.supabase
        .from('agents')
        .update({
          total_runs: agent.total_runs + 1,
          last_run: new Date().toISOString(),
          next_run: this.calculateNextRun(agent.schedule, agent.custom_schedule)
        })
        .eq('id', agentId)

      return {
        ...run,
        ...updateData
      }

    } catch (error) {
      console.error('Error executing agent task:', error)
      
      // Update run with error
      await this.supabase
        .from('agent_runs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error occurred',
          completed_at: new Date().toISOString()
        })
        .eq('id', run.id)

      throw error
    }
  }

  private async executeAgentTask(agent: Agent, taskId: string, userId: string): Promise<any> {
    // Use Groq AI for all agent tasks
    const aiResponse = await aiService.processTask({
      taskId,
      prompt: agent.task_prompt,
      userId,
      model: agent.model || 'llama3-8b-8192'
    })

    return {
      taskId,
      result: aiResponse.result,
      status: aiResponse.status,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      error: aiResponse.error
    }
  }

  async getDueAgents(): Promise<Agent[]> {
    const now = new Date().toISOString()
    
    const { data: agents, error } = await this.supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .lte('next_run', now)

    if (error) {
      console.error('Error fetching due agents:', error)
      throw new Error('Failed to fetch due agents')
    }

    return agents || []
  }

  private calculateNextRun(schedule: string, customSchedule?: string): string {
    const now = new Date()
    
    switch (schedule) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      case 'custom':
        // For custom schedules, you might want to use a cron parser
        // For now, default to daily
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    }
  }

  getAgentTemplates() {
    return [
      {
        id: 'news-summarizer',
        name: 'News Summarizer',
        description: 'Summarize current news and provide insights',
        task_prompt: 'Analyze and summarize the latest news in {topic}. Provide key insights, trends, and implications. Focus on the most important developments and their potential impact.',
        schedule: 'daily',
        category: 'news',
        model: 'llama3-8b-8192',
        complexity: 'medium'
      },
      {
        id: 'market-analyzer',
        name: 'Market Analyzer',
        description: 'Analyze market trends and provide strategic insights',
        task_prompt: 'Conduct a comprehensive market analysis for {industry/sector}. Include current trends, key players, opportunities, threats, and strategic recommendations for businesses.',
        schedule: 'weekly',
        category: 'analysis',
        model: 'llama3-8b-8192',
        complexity: 'high'
      },
      {
        id: 'content-curator',
        name: 'Content Curator',
        description: 'Curate and organize relevant content',
        task_prompt: 'Curate high-quality content about {topic}. Identify the most valuable resources, articles, and insights. Provide summaries and organize them by relevance and importance.',
        schedule: 'daily',
        category: 'content',
        model: 'llama3-8b-8192',
        complexity: 'medium'
      },
      {
        id: 'research-assistant',
        name: 'Research Assistant',
        description: 'Conduct comprehensive research on any topic',
        task_prompt: 'Conduct thorough research on {topic}. Provide a comprehensive analysis including background, current state, key findings, and future implications. Include relevant data and sources.',
        schedule: 'weekly',
        category: 'research',
        model: 'llama3-8b-8192',
        complexity: 'high'
      },
      {
        id: 'trend-monitor',
        name: 'Trend Monitor',
        description: 'Monitor and analyze emerging trends',
        task_prompt: 'Monitor and analyze emerging trends in {industry/field}. Identify new developments, technologies, and patterns. Provide insights on potential opportunities and risks.',
        schedule: 'daily',
        category: 'monitoring',
        model: 'llama3-8b-8192',
        complexity: 'medium'
      },
      {
        id: 'strategy-advisor',
        name: 'Strategy Advisor',
        description: 'Provide strategic advice and planning',
        task_prompt: 'Develop a comprehensive strategy for {business/initiative}. Include market analysis, competitive positioning, growth opportunities, and implementation roadmap with actionable steps.',
        schedule: 'weekly',
        category: 'strategy',
        model: 'llama3-8b-8192',
        complexity: 'high'
      }
    ]
  }
}

export const agentService = new AgentService() 