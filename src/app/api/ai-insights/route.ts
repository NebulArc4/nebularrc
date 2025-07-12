import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { groq } from '@ai-sdk/groq'
import { streamText } from 'ai'

export async function POST() {
  try {
    const supabase = getSupabaseServer()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data for insights
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status, category, created_at')
      .eq('user_id', user.id)

    const { data: agents } = await supabase
      .from('agents')
      .select('is_active, total_runs, category')
      .eq('user_id', user.id)

    const { data: recentActivity } = await supabase
      .from('tasks')
      .select('task_prompt, status, created_at, result')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Prepare user data for AI analysis
    const userData = {
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
      activeAgents: agents?.filter(a => a.is_active).length || 0,
      recentActivity: recentActivity || [],
      taskCategories: [...new Set(tasks?.map(t => t.category).filter(Boolean) || [])]
    }

    // Calculate completion rate
    const completionRate = userData.totalTasks > 0 ? (userData.completedTasks / userData.totalTasks * 100).toFixed(1) : 0

    // Create AI prompt for insights
    const prompt = `Analyze this user data and provide structured insights:

📊 USER METRICS
- Total Tasks: ${userData.totalTasks}
- Completed Tasks: ${userData.completedTasks}
- Completion Rate: ${completionRate}%
- Active Agents: ${userData.activeAgents}
- Task Categories: ${userData.taskCategories.join(', ') || 'None'}
- Recent Activity: ${userData.recentActivity.length} recent tasks

Provide insights in this CLEAN, STRUCTURED format:

🎯 KEY INSIGHTS
Insight 1: [Title]
- Analysis: [Detailed explanation]
- Impact: [High/Medium/Low]
- Confidence: [X%]

Insight 2: [Title]
- Analysis: [Detailed explanation]
- Impact: [High/Medium/Low]
- Confidence: [X%]

Insight 3: [Title]
- Analysis: [Detailed explanation]
- Impact: [High/Medium/Low]
- Confidence: [X%]

📈 OPTIMIZATION OPPORTUNITIES
Opportunity 1: [Specific optimization]
- Potential Improvement: [X%]
- Effort Required: [Low/Medium/High]
- Timeline: [Immediate/Short-term/Long-term]

Opportunity 2: [Specific optimization]
- Potential Improvement: [X%]
- Effort Required: [Low/Medium/High]
- Timeline: [Immediate/Short-term/Long-term]

✅ ACTIONABLE RECOMMENDATIONS
1. [Specific, actionable recommendation]
2. [Specific, actionable recommendation]
3. [Specific, actionable recommendation]

Focus on productivity improvements, efficiency gains, and optimization opportunities.`

    // Generate insights using Vercel AI SDK with Groq
    const result = await streamText({
      model: groq('llama3-8b-8192'),
      messages: [
        {
          role: 'system',
          content: 'You are an AI productivity analyst. Provide clear, structured, and actionable insights based on user data. Always include specific metrics and confidence levels.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 1200,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
} 