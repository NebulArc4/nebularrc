import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
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

    // Generate AI insights
    const insights = await aiService.generateInsights({
      userId: user.id,
      userData
    })

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
} 