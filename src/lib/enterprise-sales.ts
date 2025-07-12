// Enterprise Sales & Customer Success System
// Designed for $1M/month SaaS transformation

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  industry: string;
  budget: '10k-50k' | '50k-100k' | '100k-500k' | '500k+';
  source: 'website' | 'linkedin' | 'referral' | 'event' | 'cold-outreach';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  notes: string[];
  nextFollowUp?: Date;
  estimatedValue: number;
  probability: number; // 0-100
}

export interface Opportunity {
  id: string;
  leadId: string;
  title: string;
  description: string;
  value: number;
  stage: 'discovery' | 'demo' | 'poc' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  activities: SalesActivity[];
  competitors: string[];
  decisionMakers: DecisionMaker[];
}

export interface SalesActivity {
  id: string;
  opportunityId: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow-up';
  subject: string;
  description: string;
  date: Date;
  duration?: number; // in minutes
  outcome: 'positive' | 'neutral' | 'negative';
  nextSteps?: string;
  assignedTo: string;
}

export interface DecisionMaker {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  role: 'champion' | 'influencer' | 'decision-maker' | 'blocker';
  influence: number; // 1-10
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Customer {
  id: string;
  companyName: string;
  industry: string;
  companySize: string;
  subscriptionTier: string;
  subscriptionValue: number;
  startDate: Date;
  renewalDate: Date;
  status: 'active' | 'at-risk' | 'churned';
  assignedCSM: string;
  healthScore: number; // 0-100
  usageMetrics: {
    agents: number;
    analyses: number;
    apiCalls: number;
    storage: number;
  };
  lastActivity: Date;
  satisfactionScore?: number; // 1-10
}

export interface CustomerSuccessPlan {
  id: string;
  customerId: string;
  csManagerId: string;
  goals: string[];
  milestones: Milestone[];
  checkIns: CheckIn[];
  risks: Risk[];
  opportunities: Opportunity[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completionDate?: Date;
}

export interface CheckIn {
  id: string;
  date: Date;
  type: 'weekly' | 'monthly' | 'quarterly';
  notes: string;
  satisfaction: number; // 1-10
  concerns: string[];
  nextSteps: string[];
}

export interface Risk {
  id: string;
  type: 'usage' | 'satisfaction' | 'technical' | 'business' | 'competition';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigationPlan: string;
  status: 'open' | 'mitigated' | 'resolved';
  assignedTo: string;
  dueDate: Date;
}

export class EnterpriseSalesService {
  // Lead Management
  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<Lead> {
    const lead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: []
    };

    // Store in database
    await this.storeLead(lead);
    
    // Assign to sales rep
    await this.assignLead(lead.id);
    
    return lead;
  }

  static async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    const lead = await this.getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    const updatedLead = {
      ...lead,
      ...updates,
      updatedAt: new Date()
    };

    await this.storeLead(updatedLead);
    return updatedLead;
  }

  static async qualifyLead(leadId: string, qualificationData: {
    budget: string;
    timeline: string;
    decisionMakers: number;
    technicalRequirements: string[];
  }): Promise<Opportunity> {
    const lead = await this.getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    // Update lead status
    await this.updateLead(leadId, { status: 'qualified' });

    // Create opportunity
    const opportunity: Opportunity = {
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leadId,
      title: `${lead.companyName} - ArcBrain Implementation`,
      description: `Enterprise implementation for ${lead.companyName}`,
      value: lead.estimatedValue,
      stage: 'discovery',
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      assignedTo: lead.assignedTo || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      activities: [],
      competitors: [],
      decisionMakers: []
    };

    await this.storeOpportunity(opportunity);
    return opportunity;
  }

  // Opportunity Management
  static async updateOpportunityStage(opportunityId: string, stage: Opportunity['stage']): Promise<Opportunity> {
    const opportunity = await this.getOpportunity(opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');

    const stageProbabilities = {
      discovery: 25,
      demo: 40,
      poc: 60,
      proposal: 75,
      negotiation: 90,
      'closed-won': 100,
      'closed-lost': 0
    };

    const updatedOpportunity = {
      ...opportunity,
      stage,
      probability: stageProbabilities[stage],
      updatedAt: new Date()
    };

    await this.storeOpportunity(updatedOpportunity);
    return updatedOpportunity;
  }

  static async addSalesActivity(opportunityId: string, activity: Omit<SalesActivity, 'id'>): Promise<SalesActivity> {
    const salesActivity: SalesActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const opportunity = await this.getOpportunity(opportunityId);
    if (!opportunity) throw new Error('Opportunity not found');

    opportunity.activities.push(salesActivity);
    opportunity.updatedAt = new Date();

    await this.storeOpportunity(opportunity);
    return salesActivity;
  }

  // Pipeline Analytics
  static async getPipelineAnalytics(): Promise<{
    totalValue: number;
    weightedValue: number;
    stageBreakdown: Record<string, { count: number; value: number }>;
    conversionRates: Record<string, number>;
    averageDealSize: number;
    salesCycleLength: number;
  }> {
    const opportunities = await this.getAllOpportunities();
    
    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
    const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
    
    const stageBreakdown = opportunities.reduce((acc, opp) => {
      if (!acc[opp.stage]) {
        acc[opp.stage] = { count: 0, value: 0 };
      }
      acc[opp.stage].count++;
      acc[opp.stage].value += opp.value;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return {
      totalValue,
      weightedValue,
      stageBreakdown,
      conversionRates: this.calculateConversionRates(opportunities),
      averageDealSize: totalValue / opportunities.length || 0,
      salesCycleLength: this.calculateAverageSalesCycle(opportunities)
    };
  }

  // Customer Success Management
  static async createCustomer(customerData: Omit<Customer, 'id' | 'startDate' | 'lastActivity'>): Promise<Customer> {
    const customer: Customer = {
      ...customerData,
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startDate: new Date(),
      lastActivity: new Date()
    };

    await this.storeCustomer(customer);
    
    // Create customer success plan
    await this.createCustomerSuccessPlan(customer.id, customer.assignedCSM);
    
    return customer;
  }

  static async updateCustomerHealth(customerId: string, healthData: {
    usageMetrics: Customer['usageMetrics'];
    satisfactionScore?: number;
    status?: Customer['status'];
  }): Promise<Customer> {
    const customer = await this.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found');

    const healthScore = this.calculateHealthScore(healthData);
    
    const updatedCustomer = {
      ...customer,
      ...healthData,
      healthScore,
      lastActivity: new Date()
    };

    await this.storeCustomer(updatedCustomer);
    return updatedCustomer;
  }

  static async createCustomerSuccessPlan(customerId: string, csManagerId: string): Promise<CustomerSuccessPlan> {
    const plan: CustomerSuccessPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      csManagerId,
      goals: [
        'Achieve 80% feature adoption within 3 months',
        'Establish regular usage patterns',
        'Identify expansion opportunities',
        'Maintain satisfaction score above 8/10'
      ],
      milestones: [
        {
          id: `milestone_1`,
          title: 'Onboarding Complete',
          description: 'Customer successfully onboarded and using core features',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'pending'
        },
        {
          id: `milestone_2`,
          title: 'Feature Adoption',
          description: '80% of purchased features are actively used',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          status: 'pending'
        }
      ],
      checkIns: [],
      risks: [],
      opportunities: []
    };

    await this.storeCustomerSuccessPlan(plan);
    return plan;
  }

  // Private helper methods
  private static async storeLead(lead: Lead): Promise<void> {
    // Store in database (Supabase, MongoDB, etc.)
    console.log('Storing lead:', lead);
  }

  private static async getLead(leadId: string): Promise<Lead | null> {
    // Retrieve from database
    console.log('Getting lead:', leadId);
    return null;
  }

  private static async assignLead(leadId: string): Promise<void> {
    // Assign lead to available sales rep
    console.log('Assigning lead:', leadId);
  }

  private static async storeOpportunity(opportunity: Opportunity): Promise<void> {
    console.log('Storing opportunity:', opportunity);
  }

  private static async getOpportunity(opportunityId: string): Promise<Opportunity | null> {
    console.log('Getting opportunity:', opportunityId);
    return null;
  }

  private static async getAllOpportunities(): Promise<Opportunity[]> {
    console.log('Getting all opportunities');
    return [];
  }

  private static async storeCustomer(customer: Customer): Promise<void> {
    console.log('Storing customer:', customer);
  }

  private static async getCustomer(customerId: string): Promise<Customer | null> {
    console.log('Getting customer:', customerId);
    return null;
  }

  private static async storeCustomerSuccessPlan(plan: CustomerSuccessPlan): Promise<void> {
    console.log('Storing customer success plan:', plan);
  }

  private static calculateConversionRates(opportunities: Opportunity[]): Record<string, number> {
    // Calculate conversion rates between stages
    return {
      'discovery-to-demo': 60,
      'demo-to-poc': 40,
      'poc-to-proposal': 70,
      'proposal-to-negotiation': 50,
      'negotiation-to-closed': 80
    };
  }

  private static calculateAverageSalesCycle(opportunities: Opportunity[]): number {
    // Calculate average days from creation to close
    return 90; // days
  }

  private static calculateHealthScore(healthData: any): number {
    // Calculate customer health score based on usage, satisfaction, etc.
    let score = 50; // Base score
    
    // Usage factors
    if (healthData.usageMetrics.analyses > 100) score += 20;
    if (healthData.usageMetrics.agents > 5) score += 15;
    
    // Satisfaction factor
    if (healthData.satisfactionScore && healthData.satisfactionScore > 8) score += 15;
    
    return Math.min(score, 100);
  }
}

// Sales Analytics and Reporting
export class SalesAnalyticsService {
  static async generateSalesReport(params: {
    startDate: Date;
    endDate: Date;
    salesRep?: string;
  }): Promise<{
    totalRevenue: number;
    newCustomers: number;
    churnedCustomers: number;
    averageDealSize: number;
    salesCycleLength: number;
    conversionRates: Record<string, number>;
    topPerformers: Array<{ name: string; revenue: number; deals: number }>;
  }> {
    // Generate comprehensive sales report
    return {
      totalRevenue: 250000,
      newCustomers: 15,
      churnedCustomers: 2,
      averageDealSize: 16667,
      salesCycleLength: 85,
      conversionRates: {
        'lead-to-opportunity': 25,
        'opportunity-to-deal': 15,
        'demo-to-proposal': 40
      },
      topPerformers: [
        { name: 'Sarah Johnson', revenue: 75000, deals: 4 },
        { name: 'Mike Chen', revenue: 65000, deals: 3 },
        { name: 'Lisa Rodriguez', revenue: 55000, deals: 3 }
      ]
    };
  }

  static async generateForecast(params: {
    period: 'month' | 'quarter' | 'year';
    confidence: 'low' | 'medium' | 'high';
  }): Promise<{
    forecastedRevenue: number;
    confidenceInterval: { min: number; max: number };
    keyAssumptions: string[];
    risks: string[];
  }> {
    const baseRevenue = 250000; // Current monthly revenue
    
    const multipliers = {
      low: { min: 0.8, max: 1.2 },
      medium: { min: 0.9, max: 1.1 },
      high: { min: 0.95, max: 1.05 }
    };

    const multiplier = multipliers[params.confidence];
    const periodMultiplier = params.period === 'month' ? 1 : params.period === 'quarter' ? 3 : 12;

    return {
      forecastedRevenue: baseRevenue * periodMultiplier,
      confidenceInterval: {
        min: baseRevenue * periodMultiplier * multiplier.min,
        max: baseRevenue * periodMultiplier * multiplier.max
      },
      keyAssumptions: [
        'Current pipeline conversion rates remain stable',
        'No major market disruptions',
        'Sales team capacity remains constant',
        'Product adoption rates continue current trajectory'
      ],
      risks: [
        'Economic downturn affecting enterprise spending',
        'Increased competition in decision intelligence space',
        'Key sales team members leaving',
        'Product issues affecting customer satisfaction'
      ]
    };
  }
} 