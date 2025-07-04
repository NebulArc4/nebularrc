import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { aiService } from '@/lib/ai-service'
import fetch from 'node-fetch'
import pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { actionType, content, context, pdf, link } = await request.json()

    if (!actionType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let finalContent = content
    if (link) {
      // Fetch link content
      const res = await fetch(link)
      const html = await res.text()
      // Simple extraction: strip HTML tags
      finalContent = html.replace(/<[^>]+>/g, ' ')
    }

    // Process the quick action with Groq AI
    const result = await aiService.processQuickAction({
      actionType,
      content: finalContent,
      userId: user.id,
      context
    })

    // Create a task record for the quick action
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        task_prompt: `${actionType}: ${content}`,
        status: 'completed',
        result: result.result,
        model_used: result.model,
        tokens_used: result.tokensUsed,
        category: actionType
      })
      .select()
      .single()

    if (taskError) {
      console.error('Error creating task record:', taskError)
    }

    return NextResponse.json({
      success: true,
      result: result.result,
      taskId: task?.id
    })
  } catch (error) {
    console.error('Error processing quick action:', error)
    return NextResponse.json(
      { error: 'Failed to process quick action' },
      { status: 500 }
    )
  }
} 