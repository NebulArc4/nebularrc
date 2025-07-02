import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { aiService } from '@/lib/ai-service'
import pdfParse from 'pdf-parse'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function extractText(input: any) {
  // If input is a URL ending with .pdf, download and extract text
  if (typeof input === 'string' && input.endsWith('.pdf')) {
    try {
      const res = await fetch(input)
      if (!res.ok) throw new Error('Failed to download PDF')
      const arrayBuffer = await res.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const data = await pdfParse(buffer)
      return data.text || '[No text extracted from PDF]'
    } catch (e) {
      return '[PDF extraction error: ' + (e instanceof Error ? e.message : 'Unknown error') + ']'
    }
  }
  // If input is plain text
  if (typeof input === 'string') {
    return input
  }
  // Otherwise, return as is
  return JSON.stringify(input)
}

async function webSearch(query: string): Promise<any> {
  const apiKey = process.env.SEARCHAPI_IO_KEY
  if (!apiKey) throw new Error('SearchApi.io API key not set')
  const url = `https://www.searchapi.io/api/v1/search?engine=duckduckgo&q=${encodeURIComponent(query)}&api_key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Web search API error')
  const data = await res.json()
  const results = (data.organic_results || []).slice(0, 3).map((r: any) => ({
    title: r.title,
    link: r.link,
    snippet: r.snippet
  }))
  return results
}

export async function POST(request: NextRequest, { params }: { params: { run_id: string } }) {
  const supabase = getSupabaseServer()
  // 1. Fetch the run
  const { data: run, error: runError } = await supabase.from('multi_agent_runs').select('*').eq('id', params.run_id).single()
  if (runError || !run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })

  // 2. Fetch the agent and steps
  const { data: agent } = await supabase.from('multi_agents').select('*').eq('id', run.agent_id).single()
  const { data: steps } = await supabase.from('multi_agent_steps').select('*').eq('agent_id', run.agent_id).order('step_order', { ascending: true })

  // Persistent memory: fetch all for this agent+run
  let { data: persistentMemory }: { data: any[] | null } = await supabase.from('agent_memories').select('*').eq('agent_id', run.agent_id).eq('run_id', run.id)
  persistentMemory = persistentMemory || []
  let sessionMemory: Record<string, any> = {}
  persistentMemory.forEach(m => { sessionMemory[m.memory_key] = m.value })

  let stepResults = []
  let status = 'completed'
  let prevResult: any = run.input

  if (!steps) {
    await supabase.from('multi_agent_runs').update({ status: 'error', step_results: [], finished_at: new Date().toISOString() }).eq('id', params.run_id)
    return NextResponse.json({ error: 'No steps found' }, { status: 400 })
  }

  for (const step of steps) {
    await sleep(1000)
    let result
    // Evaluate condition if present
    if (step.condition) {
      try {
        // eslint-disable-next-line no-eval
        const cond = eval(`(function(prevResult, memory) { return (${step.condition}); })`)(prevResult, sessionMemory)
        if (!cond) {
          stepResults.push({ step_id: step.id, type: step.type, result: { skipped: true }, status: 'skipped' })
          continue
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Unknown error')
        stepResults.push({ step_id: step.id, type: step.type, result: { error: 'Condition error: ' + err.message }, status: 'error' })
        status = 'error'
        break
      }
    }
    try {
      // Read memory if requested
      if (step.memory_read && step.config?.memory_key) {
        prevResult = sessionMemory[step.config.memory_key] || prevResult
      }
      if (step.type === 'extract') {
        result = { extracted: await extractText(prevResult) }
        prevResult = result.extracted
      } else if (step.type === 'summarize') {
        const aiResp = await aiService.processTask({
          taskId: `${params.run_id}-summarize-${step.id}`,
          prompt: typeof prevResult === 'string' ? prevResult : JSON.stringify(prevResult),
          userId: run.created_by || 'system',
          taskType: 'summarization'
        })
        result = { summary: aiResp.result }
        prevResult = result.summary
      } else if (step.type === 'email') {
        const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: step.config?.to || 'user@example.com',
            subject: step.config?.subject || 'AI Agent Result',
            text: typeof prevResult === 'string' ? prevResult : JSON.stringify(prevResult)
          })
        })
        result = { sent: emailRes.ok, to: step.config?.to || 'user@example.com' }
        prevResult = result
      } else if (step.type === 'web_search') {
        const query = step.config?.query || prevResult
        const searchResult = await webSearch(query)
        result = { web_search: searchResult }
        prevResult = searchResult
      } else {
        // Custom step: just echo previous result
        result = { custom: prevResult }
        prevResult = result.custom
      }
      // Write memory if requested
      if (step.memory_write && step.config?.memory_key) {
        sessionMemory[step.config.memory_key] = prevResult
        // Upsert persistent memory
        await supabase.from('agent_memories').upsert({
          agent_id: run.agent_id,
          run_id: run.id,
          memory_key: step.config.memory_key,
          value: prevResult
        }, { onConflict: 'agent_id,run_id,memory_key' })
      }
      stepResults.push({ step_id: step.id, type: step.type, result, status: 'completed' })
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Unknown error')
      stepResults.push({ step_id: step.id, type: step.type, result: { error: err.message }, status: 'error' })
      status = 'error'
      break
    }
    await supabase.from('multi_agent_runs').update({ step_results: stepResults }).eq('id', params.run_id)
  }

  await supabase.from('multi_agent_runs').update({ step_results: stepResults, status, finished_at: new Date().toISOString() }).eq('id', params.run_id)

  return NextResponse.json({ success: true })
} 