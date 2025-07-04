import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { agentService } from '@/lib/agent-service'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agents = await agentService.getAgents(user.id)
    return NextResponse.json(agents)

  } catch (error) {
    console.error('Error in GET /api/agents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, task_prompt, schedule, custom_schedule, category, model, complexity } = body

    if (!name || !task_prompt || !schedule) {
      return NextResponse.json({ error: 'Name, task prompt, and schedule are required' }, { status: 400 })
    }

    const agent = await agentService.createAgent(user.id, {
      name,
      description: description || '',
      task_prompt,
      schedule,
      custom_schedule,
      category: category || 'other',
      model: model || 'llama3-8b-8192',
      complexity: complexity || 'medium',
      is_active: true
    })

    return NextResponse.json({
      success: true,
      agent
    })

  } catch (error) {
    console.error('Error in POST /api/agents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { agentId, ...updates } = body

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    const agent = await agentService.updateAgent(agentId, user.id, updates)

    return NextResponse.json({
      success: true,
      agent
    })

  } catch (error) {
    console.error('Error in PUT /api/agents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    await agentService.deleteAgent(agentId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/agents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 