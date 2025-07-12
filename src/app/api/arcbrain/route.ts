import { NextRequest, NextResponse } from 'next/server';
import { aiMemory, DecisionMemory } from '@/lib/ai-memory';
import { aiReasoning } from '@/lib/ai-reasoning';
import { buildRAGPrompt, getGroqAnswer } from '@/lib/groq-rag';

// Types
interface DecisionInput {
  problem_context: string;
  desired_outcome: string;
  constraints: string[];
  stakeholders: string[];
  deadline?: string;
  budget_range?: string;
}

// --- ENHANCED AIAnalysis INTERFACE ---
interface AIAnalysis {
  reasoning_steps: string[];
  technical_analysis: {
    feasibility_assessment: string[];
    implementation_complexity: string;
    technical_risks: string[];
    technology_recommendations: string[];
  };
  strategic_insights: {
    market_positioning: string[];
    competitive_analysis: string[];
    strategic_advantages: string[];
    long_term_implications: string[];
  };
  financial_analysis: {
    cost_benefit_breakdown: string[];
    roi_projections: string[];
    financial_risks: string[];
    funding_considerations: string[];
  };
  risk_assessment: Record<string, {
    description: string;
    confidence: number;
    rationale: string;
    severity: 'Low' | 'Medium' | 'High';
  }>;
  recommendations: Array<{
    recommendation: string;
    confidence: number;
    rationale: string;
    kpis: string[];
    tags?: string[];
  }>;
  estimated_impact: string;
  next_steps: string[];
  success_metrics: string[];
  scenario_analysis: Array<{
    scenario: string;
    projected_outcome: string;
    probability: number;
    kpis: string[];
  }>;
  kpis: Array<{
    name: string;
    value: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
  }>;
}

interface Decision {
  id: string;
  title: string;
  brain_type: 'finance' | 'strategy' | 'personal' | 'product' | 'execution';
  user_id: string;
  organization_id: string;
  decision_input: DecisionInput;
  ai_analysis?: AIAnalysis;
  status: 'draft' | 'analyzing' | 'reviewed' | 'approved' | 'executed' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  collaborators: string[];
  execution_notes?: string;
  outcome_tracked: boolean;
  roi_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface DecisionTemplate {
  id: string;
  name: string;
  description: string;
  brain_type: 'finance' | 'strategy' | 'personal';
  category: string;
  template_data: Record<string, any>;
  usage_count: number;
  is_public: boolean;
  created_by: string;
  organization_id?: string;
  rating: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface DecisionMetrics {
  total_decisions: number;
  decisions_by_status: Record<string, number>;
  decisions_by_brain: Record<string, number>;
  avg_decision_time: number;
  success_rate: number;
  roi_summary: Record<string, any>;
}

// Utility Functions
function getCurrentUserId(): string {
  return "user_123"; // Mock user ID - replace with real auth
}

function getCurrentOrganizationId(): string {
  return "org_456"; // Mock org ID - replace with real org detection
}

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Add memory-enhanced analysis function
async function getMemoryEnhancedAnalysis(decision: Decision): Promise<string> {
  let systemPrompt = 'You are an expert AI decision analyst with access to historical decision data. You MUST respond with ONLY valid JSON. No text before or after the JSON.';
  let analysisPrompt = '';
  
  if (decision.brain_type === 'strategy') {
    systemPrompt = 'You are a senior strategy consultant with 15+ years of experience in business strategy, market analysis, and competitive positioning. You specialize in helping Fortune 500 companies and startups make critical strategic decisions. Always respond with valid JSON only.';
    analysisPrompt = `As a senior strategy consultant, provide a clear, actionable strategic analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear strategic insights (not analysis steps, but key strategic findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical challenges to address,
  technology_recommendations: array of strings with specific tech solutions to implement
}
- strategic_insights: object with {
  market_positioning: array of strings with clear market positioning opportunities,
  competitive_analysis: array of strings with specific competitive advantages/disadvantages,
  strategic_advantages: array of strings with concrete strategic advantages to leverage,
  long_term_implications: array of strings with specific long-term strategic impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights,
  roi_projections: array of strings with concrete ROI estimates and timeframes,
  financial_risks: array of strings with specific financial risks to mitigate,
  funding_considerations: array of strings with concrete funding requirements
}
- risk_assessment: object where each key is a risk name and value is an object with { description, confidence (0-100), rationale, severity (Low/Medium/High) }
- recommendations: array of objects with { recommendation, confidence (0-100), rationale, kpis (array), tags (array, optional) }
- estimated_impact: string describing the concrete strategic impact
- next_steps: array of strings with specific actions to take
- success_metrics: array of strings with measurable success indicators
- scenario_analysis: array of objects with { scenario, projected_outcome, probability (0-100), kpis (array) }
- kpis: array of objects with { name, value, unit (optional), trend (up/down/stable, optional) }

Strategic Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language.`;
  } else if (decision.brain_type === 'finance') {
    systemPrompt = 'You are a senior financial analyst with 15+ years of experience in investment management, risk assessment, and financial planning. You have worked with institutional investors, hedge funds, and Fortune 500 companies. Always respond with valid JSON only.';
    analysisPrompt = `As a senior financial analyst, provide a clear, actionable financial analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear financial insights (not analysis steps, but key financial findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions for financial systems,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks in financial systems,
  technology_recommendations: array of strings with specific financial technology solutions
}
- strategic_insights: object with {
  market_positioning: array of strings with clear financial market positioning,
  competitive_analysis: array of strings with specific competitive financial landscape insights,
  strategic_advantages: array of strings with concrete financial strategic advantages,
  long_term_implications: array of strings with specific long-term financial impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights and numbers,
  roi_projections: array of strings with concrete ROI estimates and specific timeframes,
  financial_risks: array of strings with specific financial risks and mitigation strategies,
  funding_considerations: array of strings with concrete funding sources and requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable financial recommendations
- estimated_impact: string describing the concrete financial impact
- next_steps: array of strings with specific financial actions to take
- success_metrics: array of strings with measurable financial performance indicators

Financial Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language with specific numbers and timeframes where possible.`;
  } else if (decision.brain_type === 'product') {
    systemPrompt = 'You are a senior product strategist with 15+ years of experience in product management, user experience design, and market research. You have launched successful products at companies like Google, Apple, and Amazon. Always respond with valid JSON only.';
    analysisPrompt = `As a senior product strategist, provide a clear, actionable product analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear product insights (not analysis steps, but key product findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions for product development,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks in product development,
  technology_recommendations: array of strings with specific technology stack and tools
}
- strategic_insights: object with {
  market_positioning: array of strings with clear product market positioning,
  competitive_analysis: array of strings with specific competitive product landscape insights,
  strategic_advantages: array of strings with concrete product strategic advantages,
  long_term_implications: array of strings with specific long-term product impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights for the product,
  roi_projections: array of strings with concrete product ROI estimates,
  financial_risks: array of strings with specific product financial risks,
  funding_considerations: array of strings with concrete product funding requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable product recommendations
- estimated_impact: string describing the concrete product impact
- next_steps: array of strings with specific product actions to take
- success_metrics: array of strings with measurable product performance indicators

Product Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language with specific user insights and market opportunities.`;
  } else if (decision.brain_type === 'execution') {
    systemPrompt = 'You are a senior operations consultant with 15+ years of experience in project management, process optimization, and organizational change. You have led large-scale transformations at Fortune 500 companies. Always respond with valid JSON only.';
    analysisPrompt = `As a senior operations consultant, provide a clear, actionable execution analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear execution insights (not analysis steps, but key execution findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions for execution,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks in execution,
  technology_recommendations: array of strings with specific execution technology solutions
}
- strategic_insights: object with {
  market_positioning: array of strings with clear execution market positioning,
  competitive_analysis: array of strings with specific competitive execution landscape insights,
  strategic_advantages: array of strings with concrete execution strategic advantages,
  long_term_implications: array of strings with specific long-term execution impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights for execution,
  roi_projections: array of strings with concrete execution ROI estimates,
  financial_risks: array of strings with specific execution financial risks,
  funding_considerations: array of strings with concrete execution funding requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable execution recommendations
- estimated_impact: string describing the concrete execution impact
- next_steps: array of strings with specific execution actions to take
- success_metrics: array of strings with measurable execution performance indicators

Execution Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language with specific timelines and resource requirements.`;
  } else {
    systemPrompt = 'You are a senior decision consultant with 15+ years of experience in strategic decision-making, risk assessment, and organizational psychology. You have helped leaders make critical decisions across various industries. Always respond with valid JSON only.';
    analysisPrompt = `As a senior decision consultant, provide a clear, actionable decision analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear decision insights (not analysis steps, but key decision findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks to address,
  technology_recommendations: array of strings with specific technology solutions
}
- strategic_insights: object with {
  market_positioning: array of strings with clear market positioning opportunities,
  competitive_analysis: array of strings with specific competitive landscape insights,
  strategic_advantages: array of strings with concrete strategic advantages to leverage,
  long_term_implications: array of strings with specific long-term strategic impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights,
  roi_projections: array of strings with concrete ROI estimates and timeframes,
  financial_risks: array of strings with specific financial risks to mitigate,
  funding_considerations: array of strings with concrete funding requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable recommendations
- estimated_impact: string describing the concrete decision impact
- next_steps: array of strings with specific actions to take
- success_metrics: array of strings with measurable success indicators

Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language.`;
  }

  const prompt = `${analysisPrompt}

CRITICAL: Respond with ONLY valid JSON in the exact format specified above. Do not include any text before or after the JSON. The response must be parseable by JSON.parse().`;

  // Enhance prompt with memory context
  const enhancedPrompt = await aiMemory.generateMemoryEnhancedPrompt(
    decision.brain_type,
    JSON.stringify(decision.decision_input),
    prompt
  );

  // Use direct fetch to Groq API with memory-enhanced prompt
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: enhancedPrompt },
      ],
      stream: false,
      temperature: 0.7, // Reduced temperature for more consistent JSON
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Add reasoning-enhanced analysis function
async function getReasoningEnhancedAnalysis(decision: Decision): Promise<string> {
  let systemPrompt = 'You are an expert AI decision analyst with access to historical decision data and advanced reasoning methods. You MUST respond with ONLY valid JSON. No text before or after the JSON.';
  let analysisPrompt = '';
  
  if (decision.brain_type === 'strategy') {
    systemPrompt = 'You are a senior strategy consultant with 15+ years of experience in business strategy, market analysis, and competitive positioning. You specialize in helping Fortune 500 companies and startups make critical strategic decisions. Always respond with valid JSON only.';
    analysisPrompt = `As a senior strategy consultant, provide a clear, actionable strategic analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear strategic insights (not analysis steps, but key strategic findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical challenges to address,
  technology_recommendations: array of strings with specific tech solutions to implement
}
- strategic_insights: object with {
  market_positioning: array of strings with clear market positioning opportunities,
  competitive_analysis: array of strings with specific competitive advantages/disadvantages,
  strategic_advantages: array of strings with concrete strategic advantages to leverage,
  long_term_implications: array of strings with specific long-term strategic impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights,
  roi_projections: array of strings with concrete ROI estimates and timeframes,
  financial_risks: array of strings with specific financial risks to mitigate,
  funding_considerations: array of strings with concrete funding requirements
}
- risk_assessment: object where each key is a risk name and value is an object with { description, confidence (0-100), rationale, severity (Low/Medium/High) }
- recommendations: array of objects with { recommendation, confidence (0-100), rationale, kpis (array), tags (array, optional) }
- estimated_impact: string describing the concrete strategic impact
- next_steps: array of strings with specific actions to take
- success_metrics: array of strings with measurable success indicators

Strategic Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language.`;
  } else if (decision.brain_type === 'finance') {
    systemPrompt = 'You are a senior financial analyst with 15+ years of experience in investment management, risk assessment, and financial planning. You have worked with institutional investors, hedge funds, and Fortune 500 companies. Always respond with valid JSON only.';
    analysisPrompt = `As a senior financial analyst, provide a clear, actionable financial analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear financial insights (not analysis steps, but key financial findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions for financial systems,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks in financial systems,
  technology_recommendations: array of strings with specific financial technology solutions
}
- strategic_insights: object with {
  market_positioning: array of strings with clear financial market positioning,
  competitive_analysis: array of strings with specific competitive financial landscape insights,
  strategic_advantages: array of strings with concrete financial strategic advantages,
  long_term_implications: array of strings with specific long-term financial impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights and numbers,
  roi_projections: array of strings with concrete ROI estimates and specific timeframes,
  financial_risks: array of strings with specific financial risks and mitigation strategies,
  funding_considerations: array of strings with concrete funding sources and requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable financial recommendations
- estimated_impact: string describing the concrete financial impact
- next_steps: array of strings with specific financial actions to take
- success_metrics: array of strings with measurable financial performance indicators

Financial Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language with specific numbers and timeframes where possible.`;
  } else if (decision.brain_type === 'product') {
    systemPrompt = 'You are a senior product strategist with 15+ years of experience in product management, user experience design, and market research. You have launched successful products at companies like Google, Apple, and Amazon. Always respond with valid JSON only.';
    analysisPrompt = `As a senior product strategist, provide a clear, actionable product analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear product insights (not analysis steps, but key product findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions for product development,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks in product development,
  technology_recommendations: array of strings with specific technology stack and tools
}
- strategic_insights: object with {
  market_positioning: array of strings with clear product market positioning,
  competitive_analysis: array of strings with specific competitive product landscape insights,
  strategic_advantages: array of strings with concrete product strategic advantages,
  long_term_implications: array of strings with specific long-term product impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights for the product,
  roi_projections: array of strings with concrete product ROI estimates,
  financial_risks: array of strings with specific product financial risks,
  funding_considerations: array of strings with concrete product funding requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable product recommendations
- estimated_impact: string describing the concrete product impact
- next_steps: array of strings with specific product actions to take
- success_metrics: array of strings with measurable product performance indicators

Product Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language with specific user insights and market opportunities.`;
  } else if (decision.brain_type === 'execution') {
    systemPrompt = 'You are a senior operations consultant with 15+ years of experience in project management, process optimization, and organizational change. You have led large-scale transformations at Fortune 500 companies. Always respond with valid JSON only.';
    analysisPrompt = `As a senior operations consultant, provide a clear, actionable execution analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear execution insights (not analysis steps, but key execution findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions for execution,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks in execution,
  technology_recommendations: array of strings with specific execution technology solutions
}
- strategic_insights: object with {
  market_positioning: array of strings with clear execution market positioning,
  competitive_analysis: array of strings with specific competitive execution landscape insights,
  strategic_advantages: array of strings with concrete execution strategic advantages,
  long_term_implications: array of strings with specific long-term execution impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights for execution,
  roi_projections: array of strings with concrete execution ROI estimates,
  financial_risks: array of strings with specific execution financial risks,
  funding_considerations: array of strings with concrete execution funding requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable execution recommendations
- estimated_impact: string describing the concrete execution impact
- next_steps: array of strings with specific execution actions to take
- success_metrics: array of strings with measurable execution performance indicators

Execution Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language with specific timelines and resource requirements.`;
  } else {
    systemPrompt = 'You are a senior decision consultant with 15+ years of experience in strategic decision-making, risk assessment, and organizational psychology. You have helped leaders make critical decisions across various industries. Always respond with valid JSON only.';
    analysisPrompt = `As a senior decision consultant, provide a clear, actionable decision analysis for the following decision. Focus on RESULTS and IMPACTS, not analysis methodology. Provide a structured JSON response with the following fields:

- reasoning_steps: array of strings with clear decision insights (not analysis steps, but key decision findings)
- technical_analysis: object with {
  feasibility_assessment: array of strings with clear feasibility conclusions,
  implementation_complexity: string describing the actual complexity level,
  technical_risks: array of strings with specific technical risks to address,
  technology_recommendations: array of strings with specific technology solutions
}
- strategic_insights: object with {
  market_positioning: array of strings with clear market positioning opportunities,
  competitive_analysis: array of strings with specific competitive landscape insights,
  strategic_advantages: array of strings with concrete strategic advantages to leverage,
  long_term_implications: array of strings with specific long-term strategic impacts
}
- financial_analysis: object with {
  cost_benefit_breakdown: array of strings with specific cost-benefit insights,
  roi_projections: array of strings with concrete ROI estimates and timeframes,
  financial_risks: array of strings with specific financial risks to mitigate,
  funding_considerations: array of strings with concrete funding requirements
}
- risk_assessment: object with specific risk levels and descriptions
- recommendations: array of actionable recommendations
- estimated_impact: string describing the concrete decision impact
- next_steps: array of strings with specific actions to take
- success_metrics: array of strings with measurable success indicators

Decision Context:
${JSON.stringify(decision.decision_input, null, 2)}

IMPORTANT: Focus on delivering CLEAR RESULTS and ACTIONABLE INSIGHTS. Avoid analysis methodology - provide concrete findings, specific recommendations, and measurable impacts. Use clear, business-friendly language.`;
  }

  const prompt = `${analysisPrompt}

CRITICAL: Respond with ONLY valid JSON in the exact format specified above. Do not include any text before or after the JSON. The response must be parseable by JSON.parse().`;

  // Enhance prompt with memory context
  const enhancedPrompt = await aiMemory.generateMemoryEnhancedPrompt(
    decision.brain_type,
    JSON.stringify(decision.decision_input),
    prompt
  );

  // Generate advanced reasoning
  const reasoningContext = {
    problem: decision.title,
    brain_type: decision.brain_type,
    decision_input: decision.decision_input
  };

  const [cotResult, totResult] = await Promise.all([
    aiReasoning.generateChainOfThought(decision.title, decision.brain_type, reasoningContext),
    aiReasoning.generateTreeOfThoughts(decision.title, decision.brain_type, reasoningContext)
  ]);

  // Combine reasoning with enhanced prompt
  const reasoningEnhancedPrompt = `${enhancedPrompt}

ADVANCED REASONING CONTEXT:

Chain of Thought Analysis (${cotResult.confidence}% confidence):
${cotResult.steps.join('\n')}
Final Reasoning: ${cotResult.final_reasoning}

Tree of Thoughts Analysis (${totResult.confidence}% confidence):
Root Thought: ${totResult.root_thought}
Best Path: ${totResult.best_path.join(' → ')}
Final Decision: ${totResult.final_decision}

Use both Chain of Thought and Tree of Thoughts reasoning to enhance your analysis.`;

  // Use direct fetch to Groq API with reasoning-enhanced prompt
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: reasoningEnhancedPrompt },
      ],
      stream: false,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// API Routes
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Always return arrays for list endpoints
  if (path === 'decisions') {
    return Response.json([], { headers }); // Always an array
  }
  if (path === 'templates') {
    return Response.json([], { headers }); // Always an array
  }
  if (path === 'analytics/overview') {
    return Response.json({ summary: 'No analytics available (no DB).' }, { headers });
  }
  return Response.json({ 
    message: 'ArcBrain API is working',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  }, { headers });
}

export async function POST(req: NextRequest) {
  console.log('[ArcBrain API] POST request received');
  
  // Add CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // --- ENHANCED DEFAULT ANALYSIS ---
  function getDefaultAnalysis(status: string, errorMsg?: string): any {
    return {
      status,
      error: errorMsg || undefined,
      reasoning_steps: ['No valid analysis available.'],
      technical_analysis: {
        feasibility_assessment: [],
        implementation_complexity: '',
        technical_risks: [],
        technology_recommendations: [],
      },
      strategic_insights: {
        market_positioning: [],
        competitive_analysis: [],
        strategic_advantages: [],
        long_term_implications: [],
      },
      financial_analysis: {
        cost_benefit_breakdown: [],
        roi_projections: [],
        financial_risks: [],
        funding_considerations: [],
      },
      risk_assessment: {},
      recommendations: [],
      estimated_impact: '',
      next_steps: [],
      success_metrics: [],
      scenario_analysis: [],
      kpis: [],
    };
  }

  try {
    console.log('[ArcBrain API] Parsing request body...');
    const body = await req.json();
    console.log('[ArcBrain API] Request body:', JSON.stringify(body, null, 2));
    
    // Check if required environment variables are set
    if (!process.env.GROQ_API_KEY) {
      console.error('[ArcBrain API] GROQ_API_KEY not found');
      return NextResponse.json(getDefaultAnalysis('error', 'AI service not configured'), { 
        status: 500,
        headers 
      });
    }
    
    // Extract decision data from request
    const decision: Decision = {
      id: generateUUID(),
      title: body.query || 'Untitled Decision',
      brain_type: body.expert || 'strategy',
      user_id: getCurrentUserId(),
      organization_id: getCurrentOrganizationId(),
      decision_input: {
        problem_context: body.problem_context || '',
        desired_outcome: body.desired_outcome || '',
        constraints: body.constraints || [],
        stakeholders: body.stakeholders || [],
        deadline: body.deadline,
        budget_range: body.budget_range,
      },
      status: 'analyzing',
      priority: body.priority || 'medium',
      tags: [],
      collaborators: [],
      outcome_tracked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('[ArcBrain API] Decision object created:', decision.title);

    // Generate AI analysis with memory and reasoning
    console.log('[ArcBrain API] Starting AI analysis...');
    const analysisText = await getReasoningEnhancedAnalysis(decision);
    console.log('[ArcBrain API] AI analysis completed, parsing response...');
    
    let aiAnalysis: AIAnalysis | any;
    let status = 'success';
    try {
      aiAnalysis = JSON.parse(analysisText);
      aiAnalysis.status = 'success';
      console.log('[ArcBrain API] Analysis parsed successfully');
    } catch (parseError) {
      status = 'fallback';
      console.error('[ArcBrain API] Failed to parse AI analysis:', parseError);
      console.error('[ArcBrain API] Raw AI output:', analysisText);
      aiAnalysis = getDefaultAnalysis('fallback', 'Failed to parse AI output');
    }

    // Store decision in memory for learning
    try {
      const decisionMemory: DecisionMemory = {
        id: generateUUID(),
        decision_id: decision.id,
        brain_type: decision.brain_type,
        predicted_impact: aiAnalysis.estimated_impact,
        predicted_recommendations: aiAnalysis.recommendations,
        predicted_risks: aiAnalysis.risk_assessment,
        kpis: aiAnalysis.kpis,
        scenario_analysis: aiAnalysis.scenario_analysis,
        technical_analysis: aiAnalysis.technical_analysis,
        strategic_insights: aiAnalysis.strategic_insights,
        financial_analysis: aiAnalysis.financial_analysis,
        risk_assessment: aiAnalysis.risk_assessment,
        recommendations: aiAnalysis.recommendations,
        estimated_impact: aiAnalysis.estimated_impact,
        next_steps: aiAnalysis.next_steps,
        success_metrics: aiAnalysis.success_metrics,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await aiMemory.addDecision(decisionMemory);
      console.log('[ArcBrain API] Decision stored in memory');
    } catch (memoryError) {
      console.error('[ArcBrain API] Failed to store decision in memory:', memoryError);
      // Continue without memory storage
    }

    console.log('[ArcBrain API] Returning analysis with status:', aiAnalysis.status, '| Title:', decision.title);
    return NextResponse.json(aiAnalysis, { headers });
  } catch (error) {
    console.error('[ArcBrain API] Error:', error);
    const fallback = getDefaultAnalysis('error', 'Failed to analyze decision');
    console.log('[ArcBrain API] Returning fallback analysis with status: error');
    return NextResponse.json(fallback, { 
      status: 500,
      headers 
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    const body = await request.json();
    
    // Update decision
    if (path.startsWith('decisions/') && path.split('/').length === 2) {
      const decisionId = path.split('/')[1];
      
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.tags !== undefined) updateData.tags = body.tags;
      if (body.execution_notes !== undefined) updateData.execution_notes = body.execution_notes;
      
      updateData.updated_at = new Date().toISOString();
      
      // This is a placeholder for the actual update logic
      // Since we're not using MongoDB, we'll just return a success response
      return NextResponse.json({ message: "Decision updated" }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 