import { NextRequest } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import { groq } from '@ai-sdk/groq'
import { streamText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages } = await req.json()

    // Get user's task data for context
    const { data: tasks } = await supabase
      .from('tasks')
      .select('task_prompt, status, category, created_at, result')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Enhanced system message for structured task assistance with precise financial calculations
    const enhancedMessages = [
      {
        role: 'system' as const,
        content: `You are an expert task assistant with precise financial calculation skills. Provide CLEAN, STRUCTURED responses in this format:

For Financial/Investment Tasks:
📋 TASK ANALYSIS
[Brief overview of the financial task with EXACT calculations]

📊 FINANCIAL BREAKDOWN
- Investment Amount: [Exact amount]
- Target Profit: [Exact amount]
- Required Return: [EXACT percentage = (Profit/Investment) × 100]
- Time Period: [Duration]
- Daily Return Needed: [If applicable]

🎯 TASK OPTIONS
Option A: [Investment Strategy]
- Expected Return: [Realistic percentage]
- Risk Level: [Low/Medium/High]
- Probability of Success: [X%]
- Time Required: [Duration]

Option B: [Investment Strategy]
- Expected Return: [Realistic percentage]
- Risk Level: [Low/Medium/High]
- Probability of Success: [X%]
- Time Required: [Duration]

[Add more options if applicable]

⚠️ RISK ASSESSMENT
- Market Risk: [High/Medium/Low]
- Volatility Risk: [High/Medium/Low]
- Liquidity Risk: [High/Medium/Low]
- Timing Risk: [High/Medium/Low]

🏆 RECOMMENDATION
Best Approach: [Option Name]
Rationale: [Clear explanation with realistic expectations]
Confidence Level: [X%]

📈 ACTION PLAN
1. [Specific action with exact amounts]
2. [Risk management strategy]
3. [Monitoring and adjustment plan]
4. [Exit strategy with profit targets]

For General Task Assistance:
📋 TASK OVERVIEW
[Brief summary of the task]

🎯 TASK BREAKDOWN
Step 1: [Description with specific details]
- Time Required: [Duration]
- Resources Needed: [List]
- Success Criteria: [Clear metrics]

Step 2: [Description with specific details]
- Time Required: [Duration]
- Resources Needed: [List]
- Success Criteria: [Clear metrics]

[Continue for all steps]

⚠️ POTENTIAL CHALLENGES
- Challenge 1: [Description and mitigation]
- Challenge 2: [Description and mitigation]
- Challenge 3: [Description and mitigation]

🏆 RECOMMENDATION
Best Approach: [Strategy]
Rationale: [Clear explanation]
Confidence Level: [X%]

📈 NEXT STEPS
1. [Immediate action required]
2. [Follow-up actions]
3. [Success metrics to track]

CRITICAL FINANCIAL RULES:
1. Always calculate percentages correctly: (Part/Whole) × 100
2. Example: 50 INR profit on 1000 INR investment = (50/1000) × 100 = 5% return
3. Never confuse absolute amounts with percentages
4. Always show the calculation breakdown for transparency
5. Be realistic about investment returns - avoid suggesting unrealistic gains

Always be:
- Clear and structured
- Actionable and practical
- Precise with financial calculations
- Realistic about expectations
- Easy to understand

User's recent tasks: ${tasks?.map(t => `${t.task_prompt} (${t.status})`).join(', ') || 'None'}

Always be specific, actionable, and data-driven.`
      },
      ...messages
    ]

    const result = await streamText({
      model: groq('llama3-8b-8192'),
      messages: enhancedMessages,
      temperature: 0.7,
      maxTokens: 1500,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error in task assistant API:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 