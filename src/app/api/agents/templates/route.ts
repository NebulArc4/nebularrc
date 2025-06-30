import { NextRequest, NextResponse } from 'next/server'
import { agentService } from '@/lib/agent-service'

export async function GET(request: NextRequest) {
  try {
    const templates = agentService.getAgentTemplates()
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error in GET /api/agents/templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 