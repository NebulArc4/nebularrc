import { createClient } from '@supabase/supabase-js';

export interface DecisionMemory {
  id: string;
  decision_id: string;
  brain_type: string;
  predicted_impact: string;
  predicted_recommendations: any[];
  predicted_risks: Record<string, any>;
  kpis?: any[];
  scenario_analysis?: any[];
  technical_analysis?: any;
  strategic_insights?: any;
  financial_analysis?: any;
  risk_assessment?: any;
  recommendations?: any[];
  estimated_impact?: string;
  next_steps?: any[];
  success_metrics?: any[];
  actual_outcome?: {
    success_level: 'excellent' | 'good' | 'moderate' | 'poor' | 'failed';
    actual_impact: string;
    actual_results: string[];
    lessons_learned: string[];
    accuracy_score: number; // 0-100
  };
  created_at: string;
  updated_at: string;
}

export interface MemoryContext {
  similar_decisions: DecisionMemory[];
  success_patterns: string[];
  failure_patterns: string[];
  accuracy_trends: {
    brain_type: string;
    avg_accuracy: number;
    total_decisions: number;
  }[];
  recent_lessons: string[];
}

export class AIMemory {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Add a new decision to memory
  async addDecision(decision: DecisionMemory): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ai_memories')
        .insert({
          id: decision.id,
          decision_id: decision.decision_id,
          brain_type: decision.brain_type,
          predicted_impact: decision.predicted_impact,
          predicted_recommendations: decision.predicted_recommendations,
          predicted_risks: decision.predicted_risks,
          kpis: decision.kpis || [],
          scenario_analysis: decision.scenario_analysis || [],
          technical_analysis: decision.technical_analysis || {},
          strategic_insights: decision.strategic_insights || {},
          financial_analysis: decision.financial_analysis || {},
          risk_assessment: decision.risk_assessment || {},
          recommendations: decision.recommendations || [],
          estimated_impact: decision.estimated_impact || '',
          next_steps: decision.next_steps || [],
          success_metrics: decision.success_metrics || [],
          actual_outcome: decision.actual_outcome,
          created_at: decision.created_at,
          updated_at: decision.updated_at,
        });

      if (error) {
        console.error('Error adding decision to memory:', error);
        throw error;
      }

      console.log(`Added decision ${decision.decision_id} to AI memory`);
    } catch (error) {
      console.error('Failed to add decision to memory:', error);
      // Fallback to in-memory storage if database fails
      throw error;
    }
  }

  // Update decision with actual outcome
  async updateOutcome(decisionId: string, actualOutcome: DecisionMemory['actual_outcome']): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ai_memories')
        .update({
          actual_outcome: actualOutcome,
          updated_at: new Date().toISOString(),
        })
        .eq('decision_id', decisionId);

      if (error) {
        console.error('Error updating decision outcome:', error);
        throw error;
      }

      console.log(`Updated outcome for decision ${decisionId}`);
    } catch (error) {
      console.error('Failed to update decision outcome:', error);
      throw error;
    }
  }

  // Get all memories from database
  private async getAllMemories(): Promise<DecisionMemory[]> {
    try {
      const { data, error } = await this.supabase
        .from('ai_memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch memories:', error);
      return [];
    }
  }

  // Get relevant historical context for a new decision
  async getMemoryContext(brainType: string, decisionContext: string): Promise<MemoryContext> {
    const memories = await this.getAllMemories();
    
    const similarDecisions = memories.filter(m => 
      m.brain_type === brainType && 
      this.calculateSimilarity(decisionContext, m.predicted_impact) > 0.3
    );

    const successPatterns = this.extractSuccessPatterns(memories);
    const failurePatterns = this.extractFailurePatterns(memories);
    const accuracyTrends = this.calculateAccuracyTrends(memories);
    const recentLessons = this.extractRecentLessons(memories);

    return {
      similar_decisions: similarDecisions.slice(0, 5), // Top 5 most relevant
      success_patterns: successPatterns,
      failure_patterns: failurePatterns,
      accuracy_trends: accuracyTrends,
      recent_lessons: recentLessons
    };
  }

  // Calculate similarity between decision contexts
  private calculateSimilarity(context1: string, context2: string): number {
    const words1 = context1.toLowerCase().split(/\s+/);
    const words2 = context2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return intersection.length / union.length;
  }

  // Extract patterns from successful decisions
  private extractSuccessPatterns(memories: DecisionMemory[]): string[] {
    const successful = memories.filter(m => 
      m.actual_outcome && m.actual_outcome.success_level === 'excellent'
    );
    
    const patterns: string[] = [];
    successful.forEach(memory => {
      if (memory.actual_outcome?.lessons_learned) {
        patterns.push(...memory.actual_outcome.lessons_learned);
      }
    });
    
    return [...new Set(patterns)].slice(0, 10); // Top 10 patterns
  }

  // Extract patterns from failed decisions
  private extractFailurePatterns(memories: DecisionMemory[]): string[] {
    const failed = memories.filter(m => 
      m.actual_outcome && ['poor', 'failed'].includes(m.actual_outcome.success_level)
    );
    
    const patterns: string[] = [];
    failed.forEach(memory => {
      if (memory.actual_outcome?.lessons_learned) {
        patterns.push(...memory.actual_outcome.lessons_learned);
      }
    });
    
    return [...new Set(patterns)].slice(0, 10); // Top 10 patterns
  }

  // Calculate accuracy trends by brain type
  private calculateAccuracyTrends(memories: DecisionMemory[]) {
    const brainTypes = [...new Set(memories.map(m => m.brain_type))];
    
    return brainTypes.map(brainType => {
      const typeMemories = memories.filter(m => 
        m.brain_type === brainType && m.actual_outcome
      );
      
      const avgAccuracy = typeMemories.length > 0 
        ? typeMemories.reduce((sum, m) => sum + (m.actual_outcome?.accuracy_score || 0), 0) / typeMemories.length
        : 0;
      
      return {
        brain_type: brainType,
        avg_accuracy: avgAccuracy,
        total_decisions: typeMemories.length
      };
    });
  }

  // Extract recent lessons learned
  private extractRecentLessons(memories: DecisionMemory[]): string[] {
    const recentMemories = memories
      .filter(m => m.actual_outcome)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10);
    
    const lessons: string[] = [];
    recentMemories.forEach(memory => {
      if (memory.actual_outcome?.lessons_learned) {
        lessons.push(...memory.actual_outcome.lessons_learned);
      }
    });
    
    return [...new Set(lessons)].slice(0, 15); // Top 15 recent lessons
  }

  // Generate memory-enhanced prompt
  async generateMemoryEnhancedPrompt(
    brainType: string, 
    decisionContext: string, 
    basePrompt: string
  ): Promise<string> {
    const memoryContext = await this.getMemoryContext(brainType, decisionContext);
    
    let memoryEnhancement = '';
    
    if (memoryContext.similar_decisions.length > 0) {
      memoryEnhancement += `\n\nHISTORICAL CONTEXT (${memoryContext.similar_decisions.length} similar decisions):\n`;
      memoryContext.similar_decisions.forEach((memory, index) => {
        const accuracy = memory.actual_outcome?.accuracy_score || 0;
        const success = memory.actual_outcome?.success_level || 'unknown';
        memoryEnhancement += `${index + 1}. ${memory.predicted_impact} - ${success} (${accuracy}% accuracy)\n`;
        if (memory.actual_outcome?.lessons_learned?.[0]) {
          memoryEnhancement += `   Lesson: ${memory.actual_outcome.lessons_learned[0]}\n`;
        }
      });
    }
    
    if (memoryContext.success_patterns.length > 0) {
      memoryEnhancement += `\nSUCCESS PATTERNS:\n`;
      memoryContext.success_patterns.slice(0, 3).forEach(pattern => {
        memoryEnhancement += `• ${pattern}\n`;
      });
    }
    
    if (memoryContext.failure_patterns.length > 0) {
      memoryEnhancement += `\nFAILURE PATTERNS:\n`;
      memoryContext.failure_patterns.slice(0, 3).forEach(pattern => {
        memoryEnhancement += `• ${pattern}\n`;
      });
    }
    
    const accuracyTrend = memoryContext.accuracy_trends.find(t => t.brain_type === brainType);
    if (accuracyTrend && accuracyTrend.total_decisions > 0) {
      memoryEnhancement += `\nBRAIN PERFORMANCE: ${brainType} brain has ${accuracyTrend.avg_accuracy.toFixed(1)}% average accuracy across ${accuracyTrend.total_decisions} decisions.\n`;
    }
    
    memoryEnhancement += `\nUse this historical context to improve analysis accuracy. Consider past successes and failures.`;
    
    return basePrompt + memoryEnhancement;
  }

  // Get memory statistics
  async getMemoryStats() {
    const memories = await this.getAllMemories();
    const totalDecisions = memories.length;
    const decisionsWithOutcomes = memories.filter(m => m.actual_outcome).length;
    const avgAccuracy = decisionsWithOutcomes > 0 
      ? memories
          .filter(m => m.actual_outcome)
          .reduce((sum, m) => sum + (m.actual_outcome?.accuracy_score || 0), 0) / decisionsWithOutcomes
      : 0;
    
    return {
      total_decisions: totalDecisions,
      decisions_with_outcomes: decisionsWithOutcomes,
      average_accuracy: avgAccuracy,
      brain_types: [...new Set(memories.map(m => m.brain_type))]
    };
  }
}

// Global AI memory instance
export const aiMemory = new AIMemory(); 