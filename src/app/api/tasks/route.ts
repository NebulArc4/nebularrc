import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { aiService } from '@/lib/ai-service'
import { mockAIService } from '@/lib/mock-ai-service'

// Choose which AI service to use based on environment
const useMockAI = !process.env.HUGGINGFACE_API_KEY
const activeAIService = useMockAI ? mockAIService : aiService

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tasks for the user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json(tasks || [])

  } catch (error) {
    console.error('Error in GET /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.log('POST /api/tasks: No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('POST /api/tasks: Processing request for user:', session.user.id)

    const body = await request.json()
    const { task_prompt, model, category, complexity, estimated_tokens } = body

    if (!task_prompt || !task_prompt.trim()) {
      return NextResponse.json({ error: 'Task prompt is required' }, { status: 400 })
    }

    console.log('POST /api/tasks: Creating task with prompt:', task_prompt.substring(0, 50) + '...')

    // Create the task
    const { data: task, error: createError } = await supabase
      .from('tasks')
      .insert({
        user_id: session.user.id,
        task_prompt: task_prompt.trim(),
        status: 'pending',
        category: category || 'other',
        complexity: complexity || 'medium',
        estimated_tokens: estimated_tokens || 500,
        suggested_model: model || 'mock-ai-v1',
        model_used: model || 'mock-ai-v1'
      })
      .select()
      .single()

    if (createError) {
      console.error('POST /api/tasks: Error creating task:', createError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    console.log('POST /api/tasks: Task created successfully:', task.id)

    // Process the task immediately
    if (task) {
      try {
        console.log('POST /api/tasks: Starting AI processing for task:', task.id)
        
        // Update task status to in_progress
        await supabase
          .from('tasks')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)

        // Process the task with AI
        const aiResponse = await aiService.processTask({
          taskId: task.id,
          prompt: task.task_prompt,
          userId: session.user.id
        })

        console.log('POST /api/tasks: AI processing completed:', aiResponse.status)

        // Update task with result
        const updateData: any = {
          status: aiResponse.status === 'completed' ? 'completed' : 'failed',
          updated_at: new Date().toISOString()
        }

        if (aiResponse.status === 'completed') {
          updateData.result = aiResponse.result
          updateData.model_used = aiResponse.model
          updateData.tokens_used = aiResponse.tokensUsed
        } else {
          updateData.error_message = aiResponse.error
        }

        await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', task.id)

        console.log(`POST /api/tasks: Task ${task.id} processed successfully with ${aiResponse.model}`)

      } catch (processError) {
        console.error('POST /api/tasks: Error processing task:', processError)
        
        // Update task as failed
        await supabase
          .from('tasks')
          .update({
            status: 'failed',
            error_message: 'Task processing failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)
      }
    }

    return NextResponse.json({
      success: true,
      task: task
    })

  } catch (error) {
    console.error('POST /api/tasks: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, ...updates } = body

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Update the task
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating task:', updateError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      task: task
    })

  } catch (error) {
    console.error('Error in PUT /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Delete the task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Error deleting task:', deleteError)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Async function to process tasks in the background
async function processTaskAsync(taskId: string, prompt: string, userId: string) {
  try {
    const supabase = getSupabaseServer()
    
    // Update status to in_progress
    await supabase
      .from('tasks')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    // Process with AI
    const aiResponse = await activeAIService.processTask({
      taskId,
      prompt,
      userId
    })

    // Update with result
    const updateData: any = {
      status: aiResponse.status === 'completed' ? 'completed' : 'failed',
      updated_at: new Date().toISOString()
    }

    if (aiResponse.status === 'completed') {
      updateData.result = aiResponse.result
      updateData.model_used = aiResponse.model
      updateData.tokens_used = aiResponse.tokensUsed
    } else {
      updateData.error_message = aiResponse.error
    }

    await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)

    console.log(`Task ${taskId} processed successfully with ${useMockAI ? 'mock AI' : 'Hugging Face'}`)

  } catch (error) {
    console.error(`Error processing task ${taskId}:`, error)
    
    // Update task with error
    const supabase = getSupabaseServer()
    await supabase
      .from('tasks')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
  }
} 