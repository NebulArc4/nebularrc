import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { agentService } from '@/lib/agent-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { agentId } = body

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    const run = await agentService.runAgent(agentId, session.user.id)

    return NextResponse.json({
      success: true,
      run
    })

  } catch (error) {
    console.error('Error in POST /api/agents/run:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })
    }

    const runs = await agentService.getAgentRuns(agentId, session.user.id, limit)

    return NextResponse.json(runs)

  } catch (error) {
    console.error('Error in GET /api/agents/run:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 