// Enterprise Pricing System for ArcBrain
// Designed for $1M/month SaaS transformation

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  limits: {
    agents: number;
    analyses: number;
    users: number;
    storage: string;
    apiCalls: number;
    support: string;
  };
  target: string;
  popular?: boolean;
}

export interface UsageMetrics {
  userId: string;
  organizationId: string;
  tier: string;
  currentUsage: {
    agents: number;
    analyses: number;
    apiCalls: number;
    storage: number; // in MB
  };
  limits: {
    agents: number;
    analyses: number;
    apiCalls: number;
    storage: number;
  };
  billingCycle: {
    startDate: Date;
    endDate: Date;
    amount: number;
  };
}

export const ENTERPRISE_PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    annualPrice: 990, // 10% discount
    features: [
      '5 AI Agents',
      'Basic Analytics',
      'Email Support',
      'Standard Templates',
      'Basic Integrations',
      'Community Access'
    ],
    limits: {
      agents: 5,
      analyses: 100,
      users: 3,
      storage: '10GB',
      apiCalls: 1000,
      support: 'Email'
    },
    target: 'SMBs, Startups'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 499,
    annualPrice: 4790, // 20% discount
    features: [
      'Everything in Starter',
      '25 AI Agents',
      'Advanced Analytics',
      'Priority Support',
      'API Access',
      'Custom Templates',
      'Advanced Integrations',
      'Team Collaboration'
    ],
    limits: {
      agents: 25,
      analyses: 500,
      users: 10,
      storage: '100GB',
      apiCalls: 10000,
      support: 'Priority Email + Chat'
    },
    target: 'Growing Companies',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2499,
    annualPrice: 23990, // 20% discount
    features: [
      'Everything in Professional',
      'Unlimited Agents',
      'Custom Integrations',
      'Dedicated Support',
      'SLA Guarantee',
      'Advanced Security',
      'Custom Branding',
      'White-label Options'
    ],
    limits: {
      agents: -1, // unlimited
      analyses: 2000,
      users: 50,
      storage: '1TB',
      apiCalls: 100000,
      support: 'Dedicated Manager'
    },
    target: 'Large Enterprises'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 9999,
    annualPrice: 95990, // 20% discount
    features: [
      'Everything in Enterprise',
      'Custom AI Models',
      'On-premise Deployment',
      'Full White-label',
      'Custom Development',
      '24/7 Phone Support',
      'Dedicated Infrastructure',
      'Compliance Certifications'
    ],
    limits: {
      agents: -1, // unlimited
      analyses: -1, // unlimited
      users: -1, // unlimited
      storage: '10TB',
      apiCalls: -1, // unlimited
      support: '24/7 Dedicated Team'
    },
    target: 'Fortune 500'
  }
];

export interface BillingCycle {
  id: string;
  userId: string;
  organizationId: string;
  tier: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  usage: {
    agents: number;
    analyses: number;
    apiCalls: number;
    storage: number;
  };
  overages: {
    agents: number;
    analyses: number;
    apiCalls: number;
    storage: number;
  };
}

export const USAGE_OVERRIDE_PRICING = {
  agents: 10, // $10 per additional agent
  analyses: 0.50, // $0.50 per additional analysis
  apiCalls: 0.001, // $0.001 per additional API call
  storage: 0.10 // $0.10 per GB additional storage
};

export class EnterprisePricingService {
  static getTierById(tierId: string): PricingTier | undefined {
    return ENTERPRISE_PRICING_TIERS.find(tier => tier.id === tierId);
  }

  static getPopularTier(): PricingTier | undefined {
    return ENTERPRISE_PRICING_TIERS.find(tier => tier.popular);
  }

  static calculateUsageCost(usage: UsageMetrics): number {
    const tier = this.getTierById(usage.tier);
    if (!tier) return 0;

    let overageCost = 0;

    // Calculate overages
    if (usage.currentUsage.agents > usage.limits.agents && usage.limits.agents !== -1) {
      overageCost += (usage.currentUsage.agents - usage.limits.agents) * USAGE_OVERRIDE_PRICING.agents;
    }

    if (usage.currentUsage.analyses > usage.limits.analyses && usage.limits.analyses !== -1) {
      overageCost += (usage.currentUsage.analyses - usage.limits.analyses) * USAGE_OVERRIDE_PRICING.analyses;
    }

    if (usage.currentUsage.apiCalls > usage.limits.apiCalls && usage.limits.apiCalls !== -1) {
      overageCost += (usage.currentUsage.apiCalls - usage.limits.apiCalls) * USAGE_OVERRIDE_PRICING.apiCalls;
    }

    if (usage.currentUsage.storage > usage.limits.storage && usage.limits.storage !== -1) {
      overageCost += (usage.currentUsage.storage - usage.limits.storage) * USAGE_OVERRIDE_PRICING.storage;
    }

    return tier.price + overageCost;
  }

  static getRecommendedTier(usage: {
    agents: number;
    analyses: number;
    users: number;
    apiCalls: number;
    storage: number;
  }): PricingTier {
    // Simple recommendation logic
    if (usage.users > 50 || usage.agents > 25) {
      return ENTERPRISE_PRICING_TIERS.find(t => t.id === 'elite')!;
    } else if (usage.users > 10 || usage.agents > 5) {
      return ENTERPRISE_PRICING_TIERS.find(t => t.id === 'enterprise')!;
    } else if (usage.users > 3 || usage.analyses > 50) {
      return ENTERPRISE_PRICING_TIERS.find(t => t.id === 'professional')!;
    } else {
      return ENTERPRISE_PRICING_TIERS.find(t => t.id === 'starter')!;
    }
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  static getAnnualSavings(tier: PricingTier): number {
    return (tier.price * 12) - tier.annualPrice;
  }

  static getSavingsPercentage(tier: PricingTier): number {
    return Math.round(((tier.price * 12) - tier.annualPrice) / (tier.price * 12) * 100);
  }
}

// Enterprise-specific features and limits
export const ENTERPRISE_FEATURES = {
  SSO: ['enterprise', 'elite'],
  RBAC: ['enterprise', 'elite'],
  AUDIT_LOGS: ['enterprise', 'elite'],
  CUSTOM_BRANDING: ['enterprise', 'elite'],
  WHITE_LABEL: ['elite'],
  ON_PREMISE: ['elite'],
  CUSTOM_AI_MODELS: ['elite'],
  DEDICATED_SUPPORT: ['enterprise', 'elite'],
  SLA_GUARANTEE: ['enterprise', 'elite'],
  COMPLIANCE_CERTIFICATIONS: ['elite']
};

export const hasFeature = (tierId: string, feature: keyof typeof ENTERPRISE_FEATURES): boolean => {
  return ENTERPRISE_FEATURES[feature].includes(tierId);
}; 