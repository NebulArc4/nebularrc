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
      // Execute the agent task
      const aiResponse = await aiService.processTask({
        taskId: run.id,
        prompt: agent.task_prompt,
        userId: userId
      })

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
          last_run: new Date().toISOString(),
          next_run: this.calculateNextRun(agent.schedule, agent.custom_schedule),
          total_runs: agent.total_runs + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId)

      return { ...run, ...updateData }

    } catch (error) {
      // Update run as failed
      await this.supabase
        .from('agent_runs')
        .update({
          status: 'failed',
          error_message: 'Agent execution failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', run.id)

      throw error
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
        // For custom schedules, we'll use a simple approach
        // In production, you'd want to use a proper cron parser
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    }
  }

  // Get agent templates for common use cases
  getAgentTemplates() {
    return [
      {
        id: 'startup-news',
        name: 'Startup News Aggregator',
        description: 'Collects and summarizes the latest startup news and funding rounds',
        task_prompt: 'Research and provide a comprehensive summary of the latest startup news, funding rounds, and industry developments from the past 24 hours. Include key metrics, notable companies, and emerging trends.',
        schedule: 'daily' as const,
        category: 'news',
        model: 'mock-ai-v1',
        complexity: 'medium' as const
      },
      {
        id: 'market-analysis',
        name: 'Market Analysis Agent',
        description: 'Analyzes market trends and provides insights on specific industries',
        task_prompt: 'Conduct a market analysis for the technology sector, focusing on emerging trends, competitive landscape, and growth opportunities. Include data on market size, key players, and future projections.',
        schedule: 'weekly' as const,
        category: 'analysis',
        model: 'mock-ai-v1',
        complexity: 'high' as const
      },
      {
        id: 'competitor-monitor',
        name: 'Competitor Monitor',
        description: 'Tracks competitor activities and product updates',
        task_prompt: 'Monitor and report on competitor activities, product launches, pricing changes, and strategic moves. Focus on companies in the AI/ML space and provide actionable insights.',
        schedule: 'daily' as const,
        category: 'monitoring',
        model: 'mock-ai-v1',
        complexity: 'medium' as const
      },
      {
        id: 'content-curator',
        name: 'Content Curator',
        description: 'Curates relevant content and articles for your industry',
        task_prompt: 'Curate and summarize the most relevant articles, blog posts, and research papers in the AI and machine learning space. Focus on practical insights and actionable content.',
        schedule: 'daily' as const,
        category: 'content',
        model: 'mock-ai-v1',
        complexity: 'low' as const
      },
      {
        id: 'social-media-monitor',
        name: 'Social Media Monitor',
        description: 'Monitors social media for brand mentions and sentiment',
        task_prompt: 'Monitor social media platforms for mentions of our brand and competitors. Analyze sentiment, identify trending topics, and report on key conversations in our industry.',
        schedule: 'hourly' as const,
        category: 'monitoring',
        model: 'mock-ai-v1',
        complexity: 'medium' as const
      }
    ]
  }
}

export const agentService = new AgentService() 