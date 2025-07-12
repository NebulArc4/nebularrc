import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function saveArcBrainAnalysis(userId: string, query: string, analysis: unknown) {
  const { data, error } = await supabase
    .from('arcbrain_analyses')
    .insert({
      user_id: userId,
      query: query,
      analysis: analysis,
      created_at: new Date().toISOString(),
    })
    .select()

  if (error) {
    console.error('Error saving ArcBrain analysis:', error)
    throw error
  }

  return data
}

export async function saveDecisionLog(
  userId: string,
  query: string,
  expert: string,
  analysis: unknown,
  recommendation: string,
  confidence: number
) {
  const { data, error } = await supabase
    .from('decision_logs')
    .insert([
      {
        user_id: userId,
        query,
        expert_module: expert,
        analysis_data: analysis,
        recommendation,
        confidence_score: confidence,
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error('Error saving decision log:', error);
    throw error;
  }

  return data;
}

export async function getDecisionHistory(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('decision_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching decision history:', error);
    throw error;
  }

  return data;
} 