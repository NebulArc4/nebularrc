import { NextRequest, NextResponse } from 'next/server'
import { agentService } from '@/lib/agent-service'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Simple authentication - in production, use proper API keys
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid Authorization header' 
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        }
      })
    }

    const token = authHeader.split(' ')[1]
    // In production, validate this token properly
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ 
        error: 'Invalid token',
        message: 'The provided API key is invalid'
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        }
      })
    }

    console.log('Cron: Starting agent execution check...')

    // Get all due agents
    const dueAgents = await agentService.getDueAgents()
    console.log(`Cron: Found ${dueAgents.length} due agents`)

    const results = []

    // Run each due agent
    for (const agent of dueAgents) {
      try {
        console.log(`Cron: Running agent ${agent.id} (${agent.name})`)
        const run = await agentService.runAgent(agent.id, agent.user_id)
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          status: 'success',
          runId: run.id,
          result: run.result
        })
        console.log(`Cron: Agent ${agent.id} completed successfully`)
      } catch (error) {
        console.error(`Cron: Error running agent ${agent.id}:`, error)
        results.push({
          agentId: agent.id,
          agentName: agent.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${dueAgents.length} agents`,
      results,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      }
    })

  } catch (error) {
    console.error('Cron: Error processing agents:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing agents'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      }
    })
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Agent cron endpoint is running',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    }
  })
} 