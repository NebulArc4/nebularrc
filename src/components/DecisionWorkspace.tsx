'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Users, 
  Calendar, 
  DollarSign, 
  Tag, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Plus,
  Save,
  Play,
  RefreshCw
} from 'lucide-react';
import { arcbrainAPI, type CreateDecisionRequest, type Decision, type AIAnalysis } from '@/lib/arcbrain-api';

interface DecisionWorkspaceProps {
  brainType: 'finance' | 'strategy' | 'personal';
  onDecisionCreated?: (decision: Decision) => void;
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
}

const brainTypeConfig = {
  finance: {
    title: 'Finance Brain',
    description: 'Make data-driven financial decisions with AI-powered analysis',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  strategy: {
    title: 'Strategy Brain',
    description: 'Develop strategic initiatives with comprehensive market analysis',
    icon: TrendingUp,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  personal: {
    title: 'Personal Brain',
    description: 'Navigate life decisions with personalized AI guidance',
    icon: Lightbulb,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

export default function DecisionWorkspace({ 
  brainType, 
  onDecisionCreated, 
  onAnalysisComplete 
}: DecisionWorkspaceProps) {
  const [formData, setFormData] = useState<CreateDecisionRequest>({
    title: '',
    brain_type: brainType,
    problem_context: '',
    desired_outcome: '',
    constraints: [''],
    stakeholders: [''],
    priority: 'medium',
    tags: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [step, setStep] = useState<'input' | 'review' | 'analysis' | 'complete'>('input');

  const config = brainTypeConfig[brainType];
  const IconComponent = config.icon;

  const handleInputChange = (field: keyof CreateDecisionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'constraints' | 'stakeholders', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'constraints' | 'stakeholders') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'constraints' | 'stakeholders', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCreateDecision = async () => {
    setIsLoading(true);
    try {
      // Create a mock decision since we don't have a real backend
      const mockDecision = {
        id: 'temp_' + Date.now(),
        title: formData.title,
        brain_type: formData.brain_type,
        user_id: 'user_123',
        organization_id: 'org_456',
        decision_input: {
          problem_context: formData.problem_context,
          desired_outcome: formData.desired_outcome,
          constraints: formData.constraints,
          stakeholders: formData.stakeholders,
          deadline: '',
          budget_range: ''
        },
        status: 'draft' as const,
        priority: formData.priority,
        tags: formData.tags,
        collaborators: [],
        outcome_tracked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Created decision:', mockDecision);
      setCurrentDecision(mockDecision);
      setStep('review');
      onDecisionCreated?.(mockDecision);
    } catch (error) {
      console.error('Failed to create decision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDecision = async () => {
    if (!currentDecision) return;
    
    setIsLoading(true);
    try {
      // Call the API directly with the decision data
      const response = await fetch('/api/arcbrain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentDecision.title,
          expert: currentDecision.brain_type,
          problem_context: currentDecision.decision_input?.problem_context || '',
          desired_outcome: currentDecision.decision_input?.desired_outcome || '',
          constraints: currentDecision.decision_input?.constraints || [],
          stakeholders: currentDecision.decision_input?.stakeholders || [],
          deadline: currentDecision.decision_input?.deadline || '',
          budget_range: currentDecision.decision_input?.budget_range || ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze decision');
      }
      
      const analysis = await response.json();
      console.log('Analysis result:', analysis);
      setAnalysis(analysis);
      setStep('analysis');
      onAnalysisComplete?.(analysis);
    } catch (error) {
      console.error('Failed to analyze decision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className={`rounded-2xl p-6 ${config.bgColor} ${config.borderColor} border`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color} text-white`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {['input', 'review', 'analysis', 'complete'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName 
                  ? 'bg-blue-600 text-white' 
                  : index < ['input', 'review', 'analysis', 'complete'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < ['input', 'review', 'analysis', 'complete'].indexOf(step)
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Decision Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decision Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="Enter decision title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Problem Context */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Problem Context
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the problem or situation
                  </label>
                  <textarea
                    value={formData.problem_context}
                    onChange={(e) => handleInputChange('problem_context', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="Provide a detailed description of the problem or situation you're facing..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Outcome
                  </label>
                  <textarea
                    value={formData.desired_outcome}
                    onChange={(e) => handleInputChange('desired_outcome', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="What outcome are you hoping to achieve?"
                  />
                </div>
              </div>
            </div>

            {/* Constraints and Stakeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Constraints
                </h2>
                
                <div className="space-y-3">
                  {formData.constraints.map((constraint, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) => handleArrayInputChange('constraints', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                        placeholder="Enter constraint..."
                      />
                      {formData.constraints.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('constraints', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('constraints')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Constraint
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Stakeholders
                </h2>
                
                <div className="space-y-3">
                  {formData.stakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={stakeholder}
                        onChange={(e) => handleArrayInputChange('stakeholders', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                        placeholder="Enter stakeholder..."
                      />
                      {formData.stakeholders.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('stakeholders', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('stakeholders')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Stakeholder
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCreateDecision}
                disabled={isLoading || !formData.title || !formData.problem_context}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Create Decision
              </button>
            </div>
          </motion.div>
        )}

        {step === 'review' && currentDecision && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Decision Review</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Decision Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Title:</span>
                      <p className="font-medium">{currentDecision.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(currentDecision.priority)}`}>
                        {currentDecision.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {currentDecision.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Problem Context</h3>
                  <p className="text-gray-700">{currentDecision.decision_input?.problem_context || 'No problem context provided'}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Desired Outcome</h3>
                <p className="text-gray-700">{currentDecision.decision_input?.desired_outcome || 'No desired outcome specified'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setStep('input')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                onClick={handleAnalyzeDecision}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Start AI Analysis
              </button>
            </div>
          </motion.div>
        )}

        {step === 'analysis' && analysis && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                AI Analysis Results
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Confidence Score */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Confidence Score</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(analysis.confidence_score * 100)}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysis.confidence_score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Impact */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Estimated Impact</h3>
                  <p className="text-lg font-medium text-purple-700">{analysis.estimated_impact}</p>
                </div>
              </div>

              {/* Reasoning Steps */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Analysis Reasoning</h3>
                <div className="space-y-3">
                  {Array.isArray(analysis.reasoning_steps) && analysis.reasoning_steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Pros
                  </h3>
                  <ul className="space-y-2">
                    {(Array.isArray(analysis.pros_cons?.pros) ? analysis.pros_cons.pros : []).map((pro, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-green-700">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Cons
                  </h3>
                  <ul className="space-y-2">
                    {(Array.isArray(analysis.pros_cons?.cons) ? analysis.pros_cons.cons : []).map((con, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-red-700">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Risk Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(analysis.risk_assessment || {}).map(([risk, level]) => (
                    <div key={risk} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 capitalize">{risk.replace('_', ' ')}</div>
                      <div className="font-medium text-gray-900">{level}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Recommendations</h3>
                <div className="space-y-3">
                  {Array.isArray(analysis.recommendations) && analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setStep('complete')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Complete Decision
              </button>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Decision Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your decision has been analyzed and is ready for review.
            </p>
            <button
              onClick={() => {
                setStep('input');
                setFormData({
                  title: '',
                  brain_type: brainType,
                  problem_context: '',
                  desired_outcome: '',
                  constraints: [''],
                  stakeholders: [''],
                  priority: 'medium',
                  tags: []
                });
                setCurrentDecision(null);
                setAnalysis(null);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create New Decision
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 