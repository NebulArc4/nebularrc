import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { input } = await request.json()
  // 1. Create the run (pending)
  const { data: run, error } = await supabase.from('multi_agent_runs').insert({
    agent_id: params.id, input, status: 'pending', step_results: []
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 2. Trigger async execution (call execute endpoint)
  // (In production, use a queue or background job)
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/multi-agents/runs/${run.id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id })
  }).catch(() => {})

  // 3. Return the run immediately
  return NextResponse.json(run)
} 