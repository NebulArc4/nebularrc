'use client'

import React, { useState } from 'react'
import { ENTERPRISE_PRICING_TIERS, EnterprisePricingService, hasFeature } from '@/lib/enterprise-pricing'
import { Check, Star, Building2, Users, Zap, Shield, Globe, Crown } from 'lucide-react'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const getPrice = (tier: any) => {
    return billingCycle === 'annual' ? tier.annualPrice : tier.price
  }

  const getSavings = (tier: any) => {
    if (billingCycle === 'annual') {
      return EnterprisePricingService.getSavingsPercentage(tier)
    }
    return 0
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('Agents')) return <Zap className="w-4 h-4" />
    if (feature.includes('Support')) return <Users className="w-4 h-4" />
    if (feature.includes('Security')) return <Shield className="w-4 h-4" />
    if (feature.includes('Branding') || feature.includes('White-label')) return <Globe className="w-4 h-4" />
    if (feature.includes('Custom') || feature.includes('Elite')) return <Crown className="w-4 h-4" />
    return <Check className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] dark:from-[#18181b] dark:to-[#23233a] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent mb-6">
            Enterprise Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Scale from startup to Fortune 500 with our comprehensive decision intelligence platform
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Annual
              {billingCycle === 'annual' && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Save up to 20%
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {ENTERPRISE_PRICING_TIERS.map((tier, index) => (
            <div
              key={tier.id}
              className={`relative bg-white/80 dark:bg-[#23233a]/80 backdrop-blur-xl border-2 rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
                tier.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                  : 'border-gray-200/60 dark:border-[#23233a]/60'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Tier Icon */}
              <div className="flex items-center gap-3 mb-6">
                {tier.id === 'starter' && <Building2 className="w-8 h-8 text-gray-600" />}
                {tier.id === 'professional' && <Users className="w-8 h-8 text-blue-600" />}
                {tier.id === 'enterprise' && <Shield className="w-8 h-8 text-purple-600" />}
                {tier.id === 'elite' && <Crown className="w-8 h-8 text-yellow-600" />}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    ${getPrice(tier)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /{billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                {getSavings(tier) > 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Save ${EnterprisePricingService.getAnnualSavings(tier)} annually
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tier.target}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      {getFeatureIcon(feature)}
      </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
              ))}
            </ul>

              {/* Limits */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Limits</h4>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>• {tier.limits.agents === -1 ? 'Unlimited' : tier.limits.agents} AI Agents</div>
                  <div>• {tier.limits.analyses === -1 ? 'Unlimited' : tier.limits.analyses} Analyses</div>
                  <div>• {tier.limits.users === -1 ? 'Unlimited' : tier.limits.users} Users</div>
                  <div>• {tier.limits.storage} Storage</div>
                  <div>• {tier.limits.apiCalls === -1 ? 'Unlimited' : tier.limits.apiCalls.toLocaleString()} API Calls</div>
                </div>
              </div>

              {/* CTA Button */}
              <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                tier.popular
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
                {tier.id === 'elite' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise Features Comparison */}
        <div className="bg-white/80 dark:bg-[#23233a]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#23233a]/60 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Enterprise Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'SSO/SAML', tiers: ['enterprise', 'elite'] },
              { name: 'Role-Based Access', tiers: ['enterprise', 'elite'] },
              { name: 'Audit Logs', tiers: ['enterprise', 'elite'] },
              { name: 'Custom Branding', tiers: ['enterprise', 'elite'] },
              { name: 'White-label', tiers: ['elite'] },
              { name: 'On-premise', tiers: ['elite'] },
              { name: 'Custom AI Models', tiers: ['elite'] },
              { name: 'Dedicated Support', tiers: ['enterprise', 'elite'] },
              { name: 'SLA Guarantee', tiers: ['enterprise', 'elite'] },
              { name: 'Compliance Certifications', tiers: ['elite'] },
              { name: 'API Rate Limiting', tiers: ['professional', 'enterprise', 'elite'] },
              { name: 'Usage Analytics', tiers: ['professional', 'enterprise', 'elite'] }
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</span>
                <div className="flex gap-1">
                  {ENTERPRISE_PRICING_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      className={`w-3 h-3 rounded-full ${
                        feature.tiers.includes(tier.id) 
                          ? 'bg-green-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/80 dark:bg-[#23233a]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#23233a]/60 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the next billing cycle."
              },
              {
                q: "What happens if I exceed my limits?",
                a: "We'll notify you when you approach limits. For overages, we charge per-unit rates. You can upgrade anytime to avoid overage charges."
              },
              {
                q: "Do you offer custom pricing?",
                a: "Yes, for Enterprise and Elite plans, we offer custom pricing based on your specific needs and usage patterns."
              },
              {
                q: "What support options are available?",
                a: "Starter includes email support, Professional adds chat support, Enterprise includes dedicated support, and Elite provides 24/7 phone support."
              }
            ].map((faq, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{faq.q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
          </div>
        ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Decision Making?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of companies using ArcBrain to make better decisions faster
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 