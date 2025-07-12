#!/bin/bash

# 🚀 ArcBrain Enterprise Deployment Script
# Transforms ArcBrain from MVP to $1M/month SaaS Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Setup environment variables
setup_environment() {
    print_header "Setting Up Environment Variables"
    
    # Create .env.local if it doesn't exist
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local file"
        cat > .env.local << EOF
# ArcBrain Enterprise Configuration
# Generated on $(date)

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Providers
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here

# External Services
FINNHUB_API_KEY=your_finnhub_api_key_here
RESEND_API_KEY=your_resend_api_key_here

# Stripe Configuration (Enterprise Billing)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# MongoDB Configuration (Optional Backend)
MONGODB_URI=your_mongodb_atlas_connection_string_here
DB_NAME=arcbrain

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Analytics
GOOGLE_ANALYTICS_ID=your_ga_id_here
MIXPANEL_TOKEN=your_mixpanel_token_here

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOGTAIL_TOKEN=your_logtail_token_here

# Enterprise Features
ENABLE_SSO=true
ENABLE_RBAC=true
ENABLE_AUDIT_LOGS=true
ENABLE_WHITE_LABEL=false
ENABLE_ON_PREMISE=false

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=900000

# Feature Flags
ENABLE_ENTERPRISE_BILLING=true
ENABLE_USAGE_TRACKING=true
ENABLE_CUSTOMER_SUCCESS=true
ENABLE_SALES_PIPELINE=true
EOF
        print_success "Created .env.local file"
    else
        print_warning ".env.local already exists. Please review and update as needed."
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing npm packages"
    npm install
    
    print_status "Installing enterprise-specific packages"
    npm install stripe @types/stripe
    npm install @sentry/nextjs
    npm install mixpanel-browser
    npm install logtail
    npm install rate-limiter-flexible
    npm install jsonwebtoken @types/jsonwebtoken
    npm install crypto-js @types/crypto-js
    
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_header "Setting Up Database"
    
    print_status "Setting up Supabase tables"
    
    # Create enterprise tables
    cat > enterprise-setup.sql << EOF
-- Enterprise Database Setup for ArcBrain
-- Run this in your Supabase SQL Editor

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  industry TEXT,
  company_size TEXT,
  subscription_tier TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics JSONB NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  stripe_invoice_id TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales leads table
CREATE TABLE IF NOT EXISTS sales_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_size TEXT,
  industry TEXT,
  budget TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  estimated_value DECIMAL(10,2),
  probability INTEGER DEFAULT 25,
  notes JSONB DEFAULT '[]',
  next_follow_up TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales opportunities table
CREATE TABLE IF NOT EXISTS sales_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES sales_leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(10,2) NOT NULL,
  stage TEXT DEFAULT 'discovery',
  probability INTEGER DEFAULT 25,
  expected_close_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  activities JSONB DEFAULT '[]',
  competitors JSONB DEFAULT '[]',
  decision_makers JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer success table
CREATE TABLE IF NOT EXISTS customer_success (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_csm UUID REFERENCES auth.users(id),
  health_score INTEGER DEFAULT 50,
  satisfaction_score INTEGER,
  goals JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  check_ins JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_success ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_organization_id ON usage_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_timestamp ON usage_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_leads_updated_at BEFORE UPDATE ON sales_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_opportunities_updated_at BEFORE UPDATE ON sales_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_success_updated_at BEFORE UPDATE ON customer_success FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

print_success "Database setup SQL generated. Run enterprise-setup.sql in your Supabase SQL Editor"
}

# Setup Stripe
setup_stripe() {
    print_header "Setting Up Stripe Integration"
    
    print_status "Creating Stripe products and prices"
    
    cat > stripe-setup.js << 'EOF'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  try {
    // Create products
    const products = [
      {
        name: 'ArcBrain Starter',
        description: 'Perfect for SMBs and startups',
        metadata: { tier: 'starter' }
      },
      {
        name: 'ArcBrain Professional',
        description: 'For growing companies',
        metadata: { tier: 'professional' }
      },
      {
        name: 'ArcBrain Enterprise',
        description: 'For large enterprises',
        metadata: { tier: 'enterprise' }
      },
      {
        name: 'ArcBrain Elite',
        description: 'For Fortune 500 companies',
        metadata: { tier: 'elite' }
      }
    ];

    for (const product of products) {
      const stripeProduct = await stripe.products.create(product);
      console.log(`Created product: ${stripeProduct.name} (${stripeProduct.id})`);
      
      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: getPrice(product.metadata.tier, 'monthly') * 100,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { tier: product.metadata.tier, billing_cycle: 'monthly' }
      });
      
      // Create annual price
      const annualPrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: getAnnualPrice(product.metadata.tier) * 100,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { tier: product.metadata.tier, billing_cycle: 'annual' }
      });
      
      console.log(`Created prices for ${stripeProduct.name}:`);
      console.log(`  Monthly: $${monthlyPrice.unit_amount / 100} (${monthlyPrice.id})`);
      console.log(`  Annual: $${annualPrice.unit_amount / 100} (${annualPrice.id})`);
    }
  } catch (error) {
    console.error('Error creating Stripe products:', error);
  }
}

function getPrice(tier, billingCycle) {
  const prices = {
    starter: { monthly: 99, annual: 990 },
    professional: { monthly: 499, annual: 4790 },
    enterprise: { monthly: 2499, annual: 23990 },
    elite: { monthly: 9999, annual: 95990 }
  };
  return prices[tier]?.[billingCycle] || 99;
}

function getAnnualPrice(tier) {
  return getPrice(tier, 'annual');
}

createStripeProducts();
EOF

    print_success "Stripe setup script generated. Run with: node stripe-setup.js"
}

# Setup monitoring
setup_monitoring() {
    print_header "Setting Up Monitoring & Analytics"
    
    print_status "Configuring Sentry for error tracking"
    cat > sentry.client.config.js << 'EOF'
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
EOF

    cat > sentry.server.config.js << 'EOF'
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
EOF

    print_status "Configuring analytics"
    cat > src/lib/analytics.ts << 'EOF'
import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
if (typeof window !== 'undefined') {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '');
}

export const Analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      mixpanel.track(event, properties);
    }
  },
  
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      mixpanel.identify(userId);
      if (properties) {
        mixpanel.people.set(properties);
      }
    }
  },
  
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      mixpanel.people.set(properties);
    }
  }
};
EOF

    print_success "Monitoring and analytics configured"
}

# Build and deploy
build_and_deploy() {
    print_header "Building and Deploying"
    
    print_status "Building the application"
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build successful"
        
        print_status "Deploying to Vercel"
        vercel --prod
        
        print_success "Deployment completed successfully!"
    else
        print_error "Build failed. Please check the errors above."
        exit 1
    fi
}

# Setup enterprise features
setup_enterprise_features() {
    print_header "Setting Up Enterprise Features"
    
    print_status "Creating enterprise middleware"
    cat > src/middleware/enterprise.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip || 'anonymous',
  points: parseInt(process.env.RATE_LIMIT_REQUESTS || '1000'),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
});

export async function enterpriseMiddleware(request: NextRequest) {
  try {
    // Rate limiting
    await rateLimiter.consume(request.ip || 'anonymous');
    
    // Audit logging for enterprise features
    if (process.env.ENABLE_AUDIT_LOGS === 'true') {
      await logAuditEvent(request);
    }
    
    return NextResponse.next();
  } catch (error) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
}

async function logAuditEvent(request: NextRequest) {
  // Implementation for audit logging
  console.log('Audit log:', {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers.get('user-agent')
  });
}
EOF

    print_status "Creating enterprise API routes"
    mkdir -p src/app/api/enterprise
    
    cat > src/app/api/enterprise/billing/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseBillingService } from '@/lib/enterprise-billing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }
    
    const subscription = await EnterpriseBillingService.getSubscription(subscriptionId);
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subscription = await EnterpriseBillingService.createSubscription(body);
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

    cat > src/app/api/enterprise/sales/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseSalesService } from '@/lib/enterprise-sales';

export async function GET(request: NextRequest) {
  try {
    const analytics = await EnterpriseSalesService.getPipelineAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
EOF

    print_success "Enterprise features configured"
}

# Main deployment function
main() {
    print_header "ArcBrain Enterprise Deployment"
    echo "This script will transform ArcBrain into a $1M/month SaaS platform"
    echo ""
    
    # Check if user wants to proceed
    read -p "Do you want to proceed with the enterprise deployment? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    setup_stripe
    setup_monitoring
    setup_enterprise_features
    build_and_deploy
    
    print_header "Enterprise Deployment Complete!"
    echo ""
    print_success "ArcBrain has been transformed into an enterprise-ready SaaS platform"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Set up your environment variables in .env.local"
    echo "2. Run the database setup SQL in Supabase"
    echo "3. Set up Stripe products and prices"
    echo "4. Configure monitoring and analytics"
    echo "5. Test all enterprise features"
    echo ""
    echo "📚 Documentation:"
    echo "- Enterprise Roadmap: ENTERPRISE_ROADMAP.md"
    echo "- Deployment Guide: DEPLOYMENT.md"
    echo "- API Documentation: /api/docs"
    echo ""
    echo "🚀 Your $1M/month SaaS platform is ready!"
}

# Run main function
main "$@" 