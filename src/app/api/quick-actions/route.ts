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

    const { actionType, content, context } = await request.json()

    if (!actionType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (actionType === 'decision_support') {
      const { options, best, rationale } = await aiService.generateDecisionSupport({
        userId: user.id,
        decisionPrompt: content
      })
      return NextResponse.json({
        success: true,
        options,
        best,
        rationale
      })
    }

    // Process the quick action with Groq AI
    const result = await aiService.processQuickAction({
      actionType,
      content,
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