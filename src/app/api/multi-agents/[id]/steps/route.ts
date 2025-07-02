import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, config, step_order, condition, memoryRead, memoryWrite } = await request.json()
  if (!type || step_order === undefined) return NextResponse.json({ error: 'Type and step_order are required' }, { status: 400 })

  const { data, error } = await supabase.from('multi_agent_steps').insert({
    agent_id: params.id,
    type,
    config,
    step_order,
    condition: condition || null,
    memory_read: !!memoryRead,
    memory_write: !!memoryWrite
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('multi_agent_steps')
    .select('*')
    .eq('agent_id', params.id)
    .order('step_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
} 