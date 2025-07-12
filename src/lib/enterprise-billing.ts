// PAYMENT/BILLING DISABLED
/*
// Enterprise Billing System for ArcBrain
// Stripe integration for $1M/month SaaS platform

export interface Subscription {
  id: string;
  userId: string;
  organizationId: string;
  tier: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  metadata: Record<string, any>;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  invoiceDate: Date;
  dueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  metadata?: Record<string, any>;
}

export interface UsageRecord {
  id: string;
  userId: string;
  organizationId: string;
  subscriptionId: string;
  timestamp: Date;
  metrics: {
    agents: number;
    analyses: number;
    apiCalls: number;
    storage: number; // in MB
  };
  cost: number;
}

export class EnterpriseBillingService {
  private static stripe: any;

  static async initialize() {
    // Initialize Stripe
    if (typeof window === 'undefined') {
      const stripe = await import('stripe');
      this.stripe = new stripe.default(process.env.STRIPE_SECRET_KEY!);
    }
  }

  // Create a new subscription
  static async createSubscription(params: {
    userId: string;
    organizationId: string;
    tier: string;
    billingCycle: 'monthly' | 'annual';
    paymentMethodId?: string;
  }): Promise<Subscription> {
    await this.initialize();

    const tier = await this.getStripePriceId(params.tier, params.billingCycle);
    
    const subscription = await this.stripe.subscriptions.create({
      customer: await this.getOrCreateCustomer(params.userId, params.organizationId),
      items: [{ price: tier }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: params.userId,
        organizationId: params.organizationId,
        tier: params.tier
      }
    });

    return this.mapStripeSubscription(subscription);
  }

  // Update subscription
  static async updateSubscription(subscriptionId: string, updates: {
    tier?: string;
    billingCycle?: 'monthly' | 'annual';
    cancelAtPeriodEnd?: boolean;
  }): Promise<Subscription> {
    await this.initialize();

    const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    
    const updateData: any = {};
    
    if (updates.tier && updates.billingCycle) {
      const newPriceId = await this.getStripePriceId(updates.tier, updates.billingCycle);
      updateData.items = [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId
      }];
    }

    if (updates.cancelAtPeriodEnd !== undefined) {
      updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
    }

    const updatedSubscription = await this.stripe.subscriptions.update(
      subscriptionId,
      updateData
    );

    return this.mapStripeSubscription(updatedSubscription);
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Subscription> {
    await this.initialize();

    const subscription = await this.stripe.subscriptions.cancel(
      subscriptionId,
      immediate ? { prorate: true } : { cancel_at_period_end: true }
    );

    return this.mapStripeSubscription(subscription);
  }

  // Record usage for metered billing
  static async recordUsage(params: {
    subscriptionId: string;
    userId: string;
    organizationId: string;
    metrics: {
      agents: number;
      analyses: number;
      apiCalls: number;
      storage: number;
    };
  }): Promise<UsageRecord> {
    await this.initialize();

    const usageRecord: UsageRecord = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      organizationId: params.organizationId,
      subscriptionId: params.subscriptionId,
      timestamp: new Date(),
      metrics: params.metrics,
      cost: this.calculateUsageCost(params.metrics)
    };

    // Store usage record in database
    await this.storeUsageRecord(usageRecord);

    // Report usage to Stripe for metered billing
    await this.reportUsageToStripe(params.subscriptionId, params.metrics);

    return usageRecord;
  }

  // Get subscription details
  static async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    await this.initialize();

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return this.mapStripeSubscription(subscription);
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  // Get invoices for subscription
  static async getInvoices(subscriptionId: string): Promise<Invoice[]> {
    await this.initialize();

    const invoices = await this.stripe.invoices.list({
      subscription: subscriptionId,
      limit: 100
    });

    return invoices.data.map((invoice: any) => this.mapStripeInvoice(invoice));
  }

  // Get usage analytics
  static async getUsageAnalytics(params: {
    organizationId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalCost: number;
    usageByMetric: Record<string, number>;
    dailyUsage: Array<{ date: string; cost: number; metrics: any }>;
  }> {
    // This would query your database for usage records
    // Implementation depends on your database structure
    
    return {
      totalCost: 0,
      usageByMetric: {
        agents: 0,
        analyses: 0,
        apiCalls: 0,
        storage: 0
      },
      dailyUsage: []
    };
  }

  // Private helper methods
  private static async getOrCreateCustomer(userId: string, organizationId: string): Promise<string> {
    // Check if customer exists
    const existingCustomers = await this.stripe.customers.list({
      email: `${userId}@${organizationId}.com`, // You might want to use actual email
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      email: `${userId}@${organizationId}.com`,
      metadata: {
        userId,
        organizationId
      }
    });

    return customer.id;
  }

  private static async getStripePriceId(tier: string, billingCycle: 'monthly' | 'annual'): Promise<string> {
    // Map your pricing tiers to Stripe price IDs
    const priceMap: Record<string, Record<string, string>> = {
      starter: {
        monthly: 'price_starter_monthly',
        annual: 'price_starter_annual'
      },
      professional: {
        monthly: 'price_professional_monthly',
        annual: 'price_professional_annual'
      },
      enterprise: {
        monthly: 'price_enterprise_monthly',
        annual: 'price_enterprise_annual'
      },
      elite: {
        monthly: 'price_elite_monthly',
        annual: 'price_elite_annual'
      }
    };

    return priceMap[tier]?.[billingCycle] || priceMap.starter.monthly;
  }

  private static mapStripeSubscription(stripeSubscription: any): Subscription {
    return {
      id: stripeSubscription.id,
      userId: stripeSubscription.metadata.userId,
      organizationId: stripeSubscription.metadata.organizationId,
      tier: stripeSubscription.metadata.tier,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer,
      metadata: stripeSubscription.metadata
    };
  }

  private static mapStripeInvoice(stripeInvoice: any): Invoice {
    return {
      id: stripeInvoice.id,
      subscriptionId: stripeInvoice.subscription,
      amount: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency,
      status: stripeInvoice.status,
      invoiceDate: new Date(stripeInvoice.created * 1000),
      dueDate: new Date(stripeInvoice.due_date * 1000),
      paidAt: stripeInvoice.status === 'paid' ? new Date(stripeInvoice.status_transitions.paid_at * 1000) : undefined,
      stripeInvoiceId: stripeInvoice.id,
      items: stripeInvoice.lines.data.map((line: any) => ({
        id: line.id,
        description: line.description,
        quantity: line.quantity || 1,
        unitPrice: line.unit_amount / 100,
        amount: line.amount / 100,
        metadata: line.metadata
      }))
    };
  }

  private static calculateUsageCost(metrics: any): number {
    // Calculate cost based on usage metrics
    // This should match your pricing structure
    const { agents, analyses, apiCalls, storage } = metrics;
    
    let cost = 0;
    
    // Example cost calculation
    cost += agents * 10; // $10 per agent
    cost += analyses * 0.50; // $0.50 per analysis
    cost += apiCalls * 0.001; // $0.001 per API call
    cost += (storage / 1024) * 0.10; // $0.10 per GB
    
    return cost;
  }

  private static async storeUsageRecord(usageRecord: UsageRecord): Promise<void> {
    // Store usage record in your database
    // Implementation depends on your database choice (Supabase, MongoDB, etc.)
    console.log('Storing usage record:', usageRecord);
  }

  private static async reportUsageToStripe(subscriptionId: string, metrics: any): Promise<void> {
    // Report usage to Stripe for metered billing
    // This is for usage-based pricing tiers
    
    try {
      await this.stripe.subscriptionItems.createUsageRecord(
        subscriptionId,
        {
          quantity: Math.round(metrics.analyses),
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment'
        }
      );
    } catch (error) {
      console.error('Error reporting usage to Stripe:', error);
    }
  }
}

// Webhook handlers for Stripe events
export class StripeWebhookHandler {
  static async handleSubscriptionUpdated(event: any): Promise<void> {
    const subscription = event.data.object;
    
    // Update subscription in your database
    console.log('Subscription updated:', subscription.id);
    
    // Send notifications if needed
    if (subscription.status === 'past_due') {
      await this.sendPaymentFailedNotification(subscription);
    }
  }

  static async handleInvoicePaymentSucceeded(event: Record<string, any>): Promise<void> {
    const invoice = event.data.object;
    
    // Update invoice status in your database
    console.log('Payment succeeded for invoice:', invoice.id);
    
    // Send receipt if needed
    await this.sendPaymentReceipt(invoice);
  }

  static async handleInvoicePaymentFailed(event: any): Promise<void> {
    const invoice = event.data.object;
    
    // Handle failed payment
    console.log('Payment failed for invoice:', invoice.id);
    
    // Send payment failed notification
    await this.sendPaymentFailedNotification(invoice);
  }

  private static async sendPaymentFailedNotification(data: any): Promise<void> {
    // Send email/SMS notification about failed payment
    console.log('Sending payment failed notification');
  }

  private static async sendPaymentReceipt(invoice: Record<string, any>): Promise<void> {
    // Send payment receipt
    console.log('Sending payment receipt');
  }
}
*/ 