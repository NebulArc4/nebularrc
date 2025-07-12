// ArcBrain Backend API Integration for Vercel Deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/arcbrain';

export interface DecisionInput {
  problem_context: string;
  desired_outcome: string;
  constraints: string[];
  stakeholders: string[];
  deadline?: string;
  budget_range?: string;
}

export interface AIAnalysis {
  status?: string;
  error?: string;
  reasoning_steps: string[];
  technical_analysis?: {
    feasibility_assessment: string[];
    implementation_complexity: string;
    technical_risks: string[];
    technology_recommendations: string[];
  };
  strategic_insights?: {
    market_positioning: string[];
    competitive_analysis: string[];
    strategic_advantages: string[];
    long_term_implications: string[];
  };
  financial_analysis?: {
    cost_benefit_breakdown: string[];
    roi_projections: string[];
    financial_risks: string[];
    funding_considerations: string[];
  };
  risk_assessment: Record<string, string>;
  recommendations: string[];
  estimated_impact: string;
  next_steps?: string[];
  success_metrics?: string[];
  pros_cons?: {
    pros: string[];
    cons: string[];
  };
  confidence_score?: number;
}

export interface Decision {
  id: string;
  title: string;
  brain_type: 'finance' | 'strategy' | 'personal';
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

export interface DecisionTemplate {
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

export interface DecisionMetrics {
  total_decisions: number;
  decisions_by_status: Record<string, number>;
  decisions_by_brain: Record<string, number>;
  avg_decision_time: number;
  success_rate: number;
  roi_summary: Record<string, any>;
}

export interface CreateDecisionRequest {
  title: string;
  brain_type: 'finance' | 'strategy' | 'personal';
  problem_context: string;
  desired_outcome: string;
  constraints: string[];
  stakeholders: string[];
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

export interface UpdateDecisionRequest {
  title?: string;
  status?: 'draft' | 'analyzing' | 'reviewed' | 'approved' | 'executed' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  execution_notes?: string;
}

export interface AIAnalysisRequest {
  decision_id: string;
  force_reanalyze: boolean;
}

class ArcBrainAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}?path=${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('health');
  }

  // Decision Management
  async createDecision(request: CreateDecisionRequest): Promise<Decision> {
    return this.request('decisions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getDecisions(params?: {
    brain_type?: 'finance' | 'strategy' | 'personal';
    status?: 'draft' | 'analyzing' | 'reviewed' | 'approved' | 'executed' | 'completed';
    skip?: number;
    limit?: number;
  }): Promise<Decision[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `decisions${queryString ? `&${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getDecision(decisionId: string): Promise<Decision> {
    return this.request(`decisions/${decisionId}`);
  }

  async updateDecision(
    decisionId: string,
    request: UpdateDecisionRequest
  ): Promise<Decision> {
    return this.request(`decisions/${decisionId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async analyzeDecision(
    decisionId: string,
    request: AIAnalysisRequest
  ): Promise<AIAnalysis> {
    return this.request(`decisions/${decisionId}/analyze`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Template Management
  async getTemplates(params?: {
    brain_type?: 'finance' | 'strategy' | 'personal';
    category?: string;
    is_public?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<DecisionTemplate[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `templates${queryString ? `&${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async createTemplate(request: {
    name: string;
    description: string;
    brain_type: 'finance' | 'strategy' | 'personal';
    category: string;
    template_data: Record<string, any>;
    is_public?: boolean;
    tags?: string[];
  }): Promise<DecisionTemplate> {
    return this.request('templates', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Analytics
  async getAnalyticsOverview(): Promise<DecisionMetrics> {
    return this.request('analytics/overview');
  }

  // Collaboration
  async startCollaboration(decisionId: string): Promise<{
    message: string;
    collaboration_id: string;
  }> {
    return this.request(`decisions/${decisionId}/collaborate`, {
      method: 'POST',
    });
  }

  async addChatMessage(
    decisionId: string,
    message: string
  ): Promise<{
    message: string;
    message_id: string;
  }> {
    return this.request(`decisions/${decisionId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

// Export singleton instance
export const arcbrainAPI = new ArcBrainAPI(); 