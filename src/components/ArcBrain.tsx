'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, CheckCircle, Zap, BarChart3, FilePlus, Download, ChevronDown, ChevronUp, ChevronRight, Settings, Target, Users, TrendingUp, History, Clock, Search, ArrowRight, Lightbulb } from 'lucide-react';
import { saveArcBrainAnalysis, saveDecisionLog, getDecisionHistory } from '../lib/supabase-browser';
import { fetchAIAnalysis, AnalysisResult, ToolCallResult } from '../lib/fetchAIAnalysis';

// Enhanced interface combining both systems
export interface ArcBrainAnalysis extends Omit<AnalysisResult, '_raw'> {
  problem?: string;
  variables?: string[];
  expertChain?: string[];
  _raw?: unknown;
  riskLive?: boolean;
  riskTimestamp?: string;
  riskDetails?: unknown;
}

// Thought logging interface
interface ThoughtStep {
  step: number;
  explanation: string;
  tools?: string[];
  timestamp: string;
}

// Decision history interface
interface DecisionLog {
  id: string;
  user_id: string;
  query: string;
  expert_module: string;
  analysis_data: ArcBrainAnalysis;
  recommendation: string;
  confidence_score: number;
  created_at: string;
}

// Expert module interface
interface ExpertModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  prompt: string;
}

const glass = 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50';

// Enhanced Thought Log Panel Component
function ThoughtLogPanel({ thoughts, isVisible, onToggle }: { thoughts: ThoughtStep[]; isVisible: boolean; onToggle: () => void }) {
  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 2: return <Search className="h-4 w-4 text-blue-500" />;
      case 3: return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 4: return <Target className="h-4 w-4 text-purple-500" />;
      default: return <ArrowRight className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Premise';
      case 2: return 'Research Summary';
      case 3: return 'Risk/Reward Estimation';
      case 4: return 'Recommendation';
      default: return `Step ${step}`;
    }
  };

  return (
    <div className={`${glass} p-6`}>
      <button 
        onClick={onToggle} 
        className="font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2 text-lg"
      >
        {isVisible ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />} 
        Chain-of-Thought Analysis
      </button>
      {isVisible && (
        <div className="space-y-4">
          {Array.isArray(thoughts) && thoughts.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {getStepIcon(step.step)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {getStepTitle(step.step)}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {step.explanation}
                  </p>
                  {Array.isArray(step.tools) && step.tools.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Tools used:</span>
                      <div className="flex gap-1">
                        {step.tools.map((tool, toolIndex) => (
                          <span
                            key={toolIndex}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Debug Panel Component
function DebugPanel({ isVisible, onToggle, debugInfo }: { isVisible: boolean; onToggle: () => void; debugInfo: string }) {
  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 p-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-all duration-200"
        title="Toggle Debug Panel"
      >
        <Settings className="h-5 w-5" />
      </button>
      
      {isVisible && (
        <div className="fixed top-16 right-4 z-40 w-96 max-h-96 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-white">Debug Panel</h3>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {debugInfo || 'No debug information available'}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

// Tool Call Results Component
function ToolCallResults({ toolResults }: { toolResults?: ToolCallResult[] }) {
  if (!toolResults || toolResults.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={`${glass} p-6`}
    >
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
        <Zap className="h-5 w-5 text-purple-500" /> Tool Invocation Results
      </h2>
      <div className="space-y-4">
        {toolResults.map((call, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">
                {call.tool}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{index + 1}
              </span>
            </div>
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Input:</p>
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                {JSON.stringify(call.input, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Output:</p>
              <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded overflow-x-auto">
                {call.output}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function useArcBrain() {
  const [analysis, setAnalysis] = useState<ArcBrainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<unknown>(null);
  const [thoughts, setThoughts] = useState<ThoughtStep[]>([]);
  const [modifiedOptions, setModifiedOptions] = useState<Array<{
    name: string;
    probability: number;
    riskLevel: string;
    pros: string[];
    cons: string[];
    modifiedProbability: number;
    modifiedRiskLevel: string;
  }>>([]);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [streamedText, setStreamedText] = useState<string>('');

  const analyze = async (query: string, expert?: string) => {
    setLoading(true);
    setAnalysis(null);
    setDebug(null);
    setThoughts([]);
    setStreamedText('');
    // Add initial thought
    setThoughts([{
      step: 1,
      explanation: "Initializing analysis with expert module...",
      tools: [expert || 'general'],
      timestamp: new Date().toLocaleTimeString()
    }]);
    try {
      // Use the enhanced fetchAIAnalysis function with streaming
      const result = await fetchAIAnalysis(
        query,
        expert,
        (debugInfo) => {
          setDebug({ debugInfo, timestamp: new Date().toISOString() });
          // Add thought for tool processing
          if (debugInfo.includes('tool calls')) {
            setThoughts(prev => [...prev, {
              step: prev.length + 1,
              explanation: "Processing tool invocations and external data...",
              tools: ['tool_processor'],
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        },
        (partial) => {
          setStreamedText(partial);
          if (thoughts.length < 2) {
            setThoughts(prev => [...prev, {
              step: prev.length + 1,
              explanation: "Streaming AI analysis...",
              tools: ['groq_stream'],
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        }
      );
      // Add completion thought
      setThoughts(prev => [...prev, {
        step: prev.length + 1,
        explanation: "Analysis complete. Generating comprehensive insights...",
        tools: ['insight_generator'],
        timestamp: new Date().toLocaleTimeString()
      }]);
      setAnalysis(result);
      setDebug({ 
        streamed: true, 
        model: expert || 'general', 
        raw: result,
        timestamp: new Date().toISOString()
      });
      setStreamedText('');
    } catch (error) {
      console.error('ArcBrain analysis error:', error);
      setDebug({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        model: expert || 'general',
        timestamp: new Date().toISOString()
      });
      // Add error thought
      setThoughts(prev => [...prev, {
        step: prev.length + 1,
        explanation: "Error occurred during analysis. Check debug panel for details.",
        tools: ['error_handler'],
        timestamp: new Date().toLocaleTimeString()
      }]);
      setStreamedText('');
    } finally {
      setLoading(false);
    }
  };

  // Update modified options when analysis changes
  useEffect(() => {
    if (analysis?.options) {
      setModifiedOptions(analysis.options.map(opt => ({
        ...opt,
        modifiedProbability: opt.probability,
        modifiedRiskLevel: opt.riskLevel
      })));
    }
  }, [analysis]);

  // Calculate confidence score based on modified values
  useEffect(() => {
    if (modifiedOptions.length > 0) {
      const avgProbability = modifiedOptions.reduce((sum, opt) => sum + opt.modifiedProbability, 0) / modifiedOptions.length;
      const riskMultiplier = modifiedOptions.reduce((sum, opt) => {
        const riskValue = opt.modifiedRiskLevel === 'Low' ? 1 : opt.modifiedRiskLevel === 'Medium' ? 0.7 : 0.4;
        return sum + riskValue;
      }, 0) / modifiedOptions.length;
      
      setConfidenceScore(Math.round(avgProbability * riskMultiplier));
    }
  }, [modifiedOptions]);

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    setModifiedOptions(prev => prev.map((opt, i) => 
      i === index ? { ...opt, [field]: value } : opt
    ));
  };

  const updateRisk = (risk: Partial<ArcBrainAnalysis>) => {
    setAnalysis(prev => prev ? { ...prev, ...risk } : prev);
  };

  return { analysis, loading, debug, thoughts, analyze, modifiedOptions, confidenceScore, handleOptionChange, updateRisk, streamedText };
}

const ArcBrain: React.FC = () => {
  const [input, setInput] = useState('Should I expand my product into Europe?');
  const [showDebug, setShowDebug] = useState(false);
  const [showThoughtLog, setShowThoughtLog] = useState(false);
  const [saved, setSaved] = useState(false);
  const { analysis, loading, debug, thoughts, analyze, modifiedOptions, confidenceScore, handleOptionChange, updateRisk, streamedText } = useArcBrain();
  const [expert, setExpert] = useState('startup');
  const [debugInfo, setDebugInfo] = useState('');
  const userId = 'user-123'; // Replace with real user ID from auth context
  const [selectedAgent, setSelectedAgent] = useState('outreach');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<Array<{
    id: string;
    name: string;
    timestamp: string;
    analysis: ArcBrainAnalysis;
    modifiedOptions: Array<{
      name: string;
      probability: number;
      riskLevel: string;
      pros: string[];
      cons: string[];
      modifiedProbability: number;
      modifiedRiskLevel: string;
    }>;
    input: string;
    expert: string;
  }>>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [selectedScenario1, setSelectedScenario1] = useState('');
  const [selectedScenario2, setSelectedScenario2] = useState('');
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set());
  const [decisionHistory, setDecisionHistory] = useState<DecisionLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [riskLoading, setRiskLoading] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const AUTO_REFRESH_MS = 60000; // 60 seconds

  const agents = [
    { id: 'outreach', name: 'Outreach Agent', description: 'Handles customer outreach and communication' },
    { id: 'followup', name: 'Follow-up Agent', description: 'Manages follow-up tasks and reminders' },
    { id: 'scheduler', name: 'Scheduler Agent', description: 'Handles scheduling and calendar management' },
  ];

  const handleGenerateActionPlan = () => {
    if (analysis?.nextSteps) {
      const actionPlan = analysis.nextSteps.join('\n');
      const blob = new Blob([actionPlan], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'action-plan.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSendToAgent = () => {
    setShowAgentModal(true);
    setDebugInfo(prev => prev + `\nSending to ${agents.find(a => a.id === selectedAgent)?.name}...`);
  };

  // Enhanced Expert Modules
  const expertModules: ExpertModule[] = [
    {
      id: 'general',
      name: 'General Brain',
      icon: '🧠',
      description: 'Multi-domain decision analysis',
      color: 'from-blue-500 to-purple-600',
      prompt: 'You are an expert decision analyst with broad knowledge across multiple domains.'
    },
    {
      id: 'strategy',
      name: 'Strategy Brain',
      icon: '📈',
      description: 'Business strategy and market analysis',
      color: 'from-green-500 to-emerald-600',
      prompt: 'You are a strategic consultant with expertise in business strategy and market analysis.'
    },
    {
      id: 'finance',
      name: 'Finance Brain',
      icon: '💸',
      description: 'Financial planning and investment',
      color: 'from-yellow-500 to-orange-600',
      prompt: 'You are a financial expert specializing in investment and business decisions.'
    },
    {
      id: 'health',
      name: 'Health Brain',
      icon: '🏥',
      description: 'Health and wellness decisions',
      color: 'from-red-500 to-pink-600',
      prompt: 'You are a healthcare expert specializing in medical and wellness decisions.'
    }
  ];

  // const selectedExpert = expertModules.find((m) => m.id === expert) || expertModules[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebugInfo(`Starting analysis with ${expert} module...\nQuery: ${input}`);
    analyze(input, expert);
    setSaved(false);
  };



  const handleActionHook = (action: string) => {
    setDebugInfo(prev => prev + `\nAction triggered: ${action}`);
    console.log(`Action hook triggered: ${action}`);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSaveScenario = () => {
    if (!analysis || !scenarioName.trim()) return;
    
    const newScenario = {
      id: Date.now().toString(),
      name: scenarioName,
      timestamp: new Date().toISOString(),
      analysis,
      modifiedOptions,
      input,
      expert
    };
    
    setSavedScenarios(prev => [...prev, newScenario]);
    setShowSaveModal(false);
    setScenarioName('');
    setDebugInfo(prev => prev + `\nScenario "${scenarioName}" saved successfully`);
  };

  const handleCompareScenarios = () => {
    if (!selectedScenario1 || !selectedScenario2) return;
    setShowCompareModal(true);
  };

  const getScenarioById = (id: string) => {
    return savedScenarios.find(s => s.id === id);
  };

  // Mock AI explanations for pros/cons
  const getExplanation = (optionName: string, type: 'pro' | 'con', index: number) => {
    const explanations = {
      'Expand to Europe': {
        pro: Array.isArray([
          "Market expansion analysis shows 40% larger addressable market in European tech sector, with 25% higher average customer lifetime value compared to current markets.",
          "Regulatory environment in target European countries is favorable for tech companies, with streamlined business registration processes and supportive startup ecosystems.",
          "Competitive landscape analysis reveals 3 major players with 60% market share, leaving significant opportunity for differentiation and market capture."
        ]) ? [
          "Market expansion analysis shows 40% larger addressable market in European tech sector, with 25% higher average customer lifetime value compared to current markets.",
          "Regulatory environment in target European countries is favorable for tech companies, with streamlined business registration processes and supportive startup ecosystems.",
          "Competitive landscape analysis reveals 3 major players with 60% market share, leaving significant opportunity for differentiation and market capture."
        ] : [],
        con: Array.isArray([
          "Initial investment requirements exceed $500K for legal compliance, office setup, and local team hiring, with 18-month break-even timeline.",
          "Cultural and language barriers may impact customer acquisition, requiring additional 30% marketing budget for localization and cultural adaptation.",
          "Time zone differences (6-9 hours) will require 24/7 support infrastructure and may impact team collaboration and customer service quality."
        ]) ? [
          "Initial investment requirements exceed $500K for legal compliance, office setup, and local team hiring, with 18-month break-even timeline.",
          "Cultural and language barriers may impact customer acquisition, requiring additional 30% marketing budget for localization and cultural adaptation.",
          "Time zone differences (6-9 hours) will require 24/7 support infrastructure and may impact team collaboration and customer service quality."
        ] : []
      },
      'Focus on US Market': {
        pro: [
          "Existing brand recognition and customer base provides 70% lower customer acquisition costs compared to new market entry.",
          "Proven business model and operational efficiency can be scaled with minimal additional investment, achieving 40% faster ROI.",
          "Strong existing partnerships and network relationships reduce go-to-market risks and accelerate growth potential."
        ],
        con: [
          "Market saturation analysis indicates limited growth potential beyond 15% annually in current segments, constraining long-term expansion.",
          "Increasing competition from 5 new entrants in the last 6 months may erode market share and pricing power.",
          "Regulatory changes in target states may require additional compliance costs of $200K annually starting next year."
        ]
      },
      'Hybrid Approach': {
        pro: [
          "Risk mitigation strategy allows testing European market with 30% of resources while maintaining US growth momentum.",
          "Learning from small-scale European operations can inform full expansion strategy, reducing overall risk by 50%.",
          "Diversified revenue streams provide stability and reduce dependency on single market performance."
        ],
        con: [
          "Resource allocation across two markets may dilute focus and reduce effectiveness in both, potentially extending time to market leadership.",
          "Operational complexity increases by 40% with dual-market operations, requiring additional management overhead and coordination costs.",
          "Limited investment in each market may not be sufficient to achieve competitive positioning or economies of scale."
        ]
      }
    };
    // Defensive access for explanations
    return (explanations[optionName as keyof typeof explanations]?.[type] && Array.isArray(explanations[optionName as keyof typeof explanations]?.[type]))
      ? explanations[optionName as keyof typeof explanations][type][index]
      : `AI analysis indicates this ${type === 'pro' ? 'advantage' : 'disadvantage'} is significant based on market research and competitive analysis.`;
  };

  const toggleExplanation = (key: string) => {
    setExpandedExplanations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Load decision history
  const loadDecisionHistory = async () => {
    setHistoryLoading(true);
    try {
      const history = await getDecisionHistory(userId);
      setDecisionHistory(history);
    } catch (error) {
      console.error('Failed to load decision history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load history on component mount
  useEffect(() => {
    loadDecisionHistory();
  }, []);

  // Enhanced save function that also saves to decision logs
  const handleSaveWithHistory = async () => {
    if (!analysis) return;
    
    try {
      // Save to existing analysis table
      await saveArcBrainAnalysis(userId, input, analysis);
      
      // Save to decision logs for history
      await saveDecisionLog(
        userId,
        input,
        expert,
        analysis,
        analysis.recommendation.bestOption,
        analysis.recommendation.confidence
      );
      
      setSaved(true);
      // Reload history
      loadDecisionHistory();
    } catch (error) {
      console.error('Failed to save analysis:', error);
    }
  };

  // Add a function to refresh live risk
  const handleRefreshRisk = async () => {
    setRiskLoading(true);
    try {
      const res = await fetch('/api/realtime-risk');
      if (!res.ok) throw new Error('Failed to fetch live risk');
      const risk = await res.json();
      updateRisk({
        riskAssessment: risk.riskAssessment,
        riskLive: true,
        riskTimestamp: risk.riskTimestamp,
        riskDetails: risk.riskDetails,
      });
    } catch (e) {
      setDebugInfo(prev => prev + `\nFailed to refresh live risk: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRiskLoading(false);
    }
  };

  useEffect(() => {
    if (analysis && analysis.riskLive) {
      // Clear any previous interval
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
      // Set up new interval
      const interval = setInterval(() => {
        handleRefreshRisk();
      }, AUTO_REFRESH_MS);
      setAutoRefreshInterval(interval);
      // Cleanup on unmount or when analysis/riskLive changes
      return () => {
        clearInterval(interval);
        setAutoRefreshInterval(null);
      };
    } else {
      // If not live, clear any interval
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis && analysis.riskLive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Debug Panel */}
      <DebugPanel isVisible={showDebug} onToggle={() => setShowDebug(!showDebug)} debugInfo={debugInfo} />

      <div className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Arc Brain
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Expert AI reasoning interface with chain-of-thought analysis, decision simulation, and interactive tools
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span>Multi-Step Reasoning</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Interactive Simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Expert Modules</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Expert Module Selector */}
        <div className={`${glass} p-6 mb-8`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Brain className="h-5 w-5 text-blue-500" />
            Choose Your Expert Brain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {expertModules.map((module) => (
              <button
                key={module.id}
                onClick={() => setExpert(module.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  expert === module.id
                    ? `border-blue-500 bg-gradient-to-r ${module.color} text-white shadow-lg`
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="text-3xl mb-2">{module.icon}</div>
                <div className="font-semibold text-sm mb-1">{module.name}</div>
                <div className={`text-xs ${expert === module.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                  {module.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Decision History Section */}
        <div className={`${glass} p-6 mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <History className="h-5 w-5 text-blue-500" />
              Decision History
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
          
          {showHistory && (
            <div className="space-y-3">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading history...</span>
                </div>
              ) : decisionHistory.length > 0 ? (
                decisionHistory.map((log) => (
                  <div key={log.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{log.query}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200`}>
                            {log.expert_module}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {log.recommendation}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {log.confidence_score}% confidence
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setInput(log.query);
                          setExpert(log.expert_module);
                        }}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Reuse
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No decision history yet. Start making decisions to see your history here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decision Input Form */}
        <div className={`${glass} overflow-hidden mb-8`}>
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Decision Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Describe your decision or dilemma to get expert AI reasoning with interactive analysis
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="decision-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What decision or dilemma would you like to analyze?
                </label>
                <textarea
                  id="decision-input"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  rows={6}
                  placeholder="Describe the specific decision you need to make. Be as detailed as possible:

• Should I invest $10,000 in tech stocks or real estate for better returns?
• Should I hire candidate A (experienced but expensive) or candidate B (junior but cheaper) for the marketing role?
• Should I expand my business to a new market (higher risk, higher reward) or focus on existing markets (stable growth)?
• Which marketing strategy should I choose: social media ads ($5K budget) or influencer partnerships ($8K budget)?
• Should I take the job offer at Company A ($80K, remote) or Company B ($95K, office-based)?

Include specific details like amounts, timeframes, and trade-offs for better analysis."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  What you&apos;ll get:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Chain-of-thought reasoning with step-by-step analysis</li>
                  <li>• Interactive decision simulation with adjustable parameters</li>
                  <li>• Expert module-specific insights and recommendations</li>
                  <li>• Comparison table with risk-adjusted scoring</li>
                  <li>• Action hooks for agent delegation and automation</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 text-lg"
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing with Arc Brain...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Launch Arc Brain Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Thought Log Panel */}
        <div className="mb-6">
          <ThoughtLogPanel
            thoughts={thoughts}
            isVisible={showThoughtLog}
            onToggle={() => setShowThoughtLog(!showThoughtLog)}
          />
        </div>

        {/* Action Hooks */}
        <div className={`${glass} p-6 mb-8`}>
          <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            Action Hooks
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleActionHook('Create Agent Plan')}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Create Agent Plan
            </button>
            <button
              onClick={() => handleActionHook('Send to Outreach Agent')}
              className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              Send to Outreach Agent
            </button>
            <button
              onClick={() => handleActionHook('Schedule Follow-up')}
              className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
            >
              Schedule Follow-up
            </button>
            <button
              onClick={() => handleActionHook('Export Analysis')}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              Export Analysis
            </button>
          </div>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`${glass} p-8 flex flex-col items-center justify-center mb-8`}
            >
              {streamedText && (
                <div className="w-full mb-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 max-h-60 overflow-y-auto">
                  <div className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Live AI Output:</div>
                  <pre className="whitespace-pre-wrap break-words">{streamedText}</pre>
                </div>
              )}
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">Analyzing with Arc Brain...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {analysis && (
          <div className="space-y-8">
            {/* Problem Framing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${glass} p-6`}
            >
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-blue-500" /> Problem Analysis
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg">{analysis.analysis}</p>
              {analysis.variables && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(analysis.variables || []).map((v, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">{v}</span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Expert Thinking Chain */}
            {Array.isArray(analysis.expertChain) && analysis.expertChain.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${glass} p-6`}
              >
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                  <Zap className="h-5 w-5 text-yellow-500" /> Expert Thinking Chain
                </h2>
                <ol className="space-y-2 list-decimal list-inside">
                  {Array.isArray(analysis.expertChain) && analysis.expertChain.map((step, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {step}
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            )}

            {/* Interactive Decision Simulator */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${glass} p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <BarChart3 className="h-5 w-5 text-green-500" /> Interactive Decision Simulator
                </h2>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{confidenceScore}%</div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(modifiedOptions || []).map((opt, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 p-4 shadow">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{opt.name}</h3>
                    
                    {/* Probability Slider */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Probability: {opt.modifiedProbability}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={opt.modifiedProbability}
                        onChange={(e) => handleOptionChange(i, 'modifiedProbability', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>

                    {/* Risk Level Slider */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Risk Level: {opt.modifiedRiskLevel}
                      </label>
                      <select
                        value={opt.modifiedRiskLevel}
                        onChange={(e) => handleOptionChange(i, 'modifiedRiskLevel', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                      </select>
                    </div>

                    {/* Current Risk Display */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(opt.modifiedRiskLevel)}`}>
                        {opt.modifiedRiskLevel} Risk
                      </span>
                      <span className={`text-sm font-medium ${getProbabilityColor(opt.modifiedProbability)}`}>
                        {opt.modifiedProbability}% probability
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-green-600 dark:text-green-400 font-medium text-sm">Pros:</span>
                      <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                        {Array.isArray(opt.pros) && opt.pros.map((pro: string, j: number) => (
                          <li key={j}>
                            {pro}
                            <button
                              onClick={() => toggleExplanation(`${opt.name}-pro-${j}`)}
                              className="text-blue-500 hover:underline ml-2"
                            >
                              {expandedExplanations.has(`${opt.name}-pro-${j}`) ? 'Hide' : 'See why'}
                            </button>
                            {expandedExplanations.has(`${opt.name}-pro-${j}`) && (
                              <div className="mt-2 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  <span className="font-semibold">AI Analysis:</span> {getExplanation(opt.name, 'pro', j)}
                                </p>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-red-600 dark:text-red-400 font-medium text-sm">Cons:</span>
                      <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                        {Array.isArray(opt.cons) && opt.cons.map((con: string, j: number) => (
                          <li key={j}>
                            {con}
                            <button
                              onClick={() => toggleExplanation(`${opt.name}-con-${j}`)}
                              className="text-blue-500 hover:underline ml-2"
                            >
                              {expandedExplanations.has(`${opt.name}-con-${j}`) ? 'Hide' : 'See why'}
                            </button>
                            {expandedExplanations.has(`${opt.name}-con-${j}`) && (
                              <div className="mt-2 ml-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                  <span className="font-semibold">AI Analysis:</span> {getExplanation(opt.name, 'con', j)}
                                </p>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Risk & Outcome Visuals */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${glass} p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                  <TrendingUp className="h-5 w-5 text-orange-500" /> Risk & Outcome Visuals
                </h2>
                {analysis.riskLive && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Live
                      {analysis.riskTimestamp && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">{new Date(analysis.riskTimestamp).toLocaleTimeString()}</span>
                      )}
                    </span>
                    <button
                      onClick={handleRefreshRisk}
                      disabled={riskLoading}
                      className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all ${riskLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {riskLoading ? 'Refreshing...' : 'Refresh Live Risk'}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Market Risk Meter */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Market Risk</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.riskAssessment.marketRisk)}`}>
                      {analysis.riskAssessment.marketRisk}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        analysis.riskAssessment.marketRisk === 'High' ? 'bg-red-500' :
                        analysis.riskAssessment.marketRisk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${analysis.riskAssessment.marketRisk === 'High' ? 80 : analysis.riskAssessment.marketRisk === 'Medium' ? 50 : 20}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Market volatility and competition factors</p>
                </div>

                {/* Volatility Risk Meter */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Volatility Risk</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.riskAssessment.volatilityRisk)}`}>
                      {analysis.riskAssessment.volatilityRisk}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        analysis.riskAssessment.volatilityRisk === 'High' ? 'bg-red-500' :
                        analysis.riskAssessment.volatilityRisk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${analysis.riskAssessment.volatilityRisk === 'High' ? 80 : analysis.riskAssessment.volatilityRisk === 'Medium' ? 50 : 20}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Price and value fluctuation potential</p>
                </div>

                {/* Timing Risk Meter */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Timing Risk</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.riskAssessment.timingRisk)}`}>
                      {analysis.riskAssessment.timingRisk}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        analysis.riskAssessment.timingRisk === 'High' ? 'bg-red-500' :
                        analysis.riskAssessment.timingRisk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${analysis.riskAssessment.timingRisk === 'High' ? 80 : analysis.riskAssessment.timingRisk === 'Medium' ? 50 : 20}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Market timing and execution risks</p>
                </div>
              </div>

              {/* Overall Risk Score */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Overall Risk Profile</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Combined risk assessment across all factors</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(() => {
                        const risks = [analysis.riskAssessment.marketRisk, analysis.riskAssessment.volatilityRisk, analysis.riskAssessment.timingRisk];
                        const highCount = risks.filter(r => r === 'High').length;
                        const mediumCount = risks.filter(r => r === 'Medium').length;
                        if (highCount >= 2) return 'High';
                        if (highCount === 1 || mediumCount >= 2) return 'Medium';
                        return 'Low';
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Risk Level</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tool Call Results */}
            <ToolCallResults toolResults={analysis.toolCallResults} />

            {/* Recommendation Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`${glass} p-6 flex flex-col md:flex-row items-center gap-6`}
            >
              <div className="flex-1">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Recommendation
                </h2>
                <p className="text-lg text-gray-900 dark:text-white font-bold mb-2">{analysis.recommendation.bestOption}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{analysis.recommendation.rationale}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Confidence:</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{analysis.recommendation.confidence}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSaveWithHistory}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-700 transition-all ${saved ? 'opacity-60' : ''}`}
                  disabled={saved}
                >
                  <FilePlus className="h-5 w-5" /> {saved ? 'Saved!' : 'Save Analysis'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-700 text-white font-semibold shadow hover:from-gray-500 hover:to-gray-800 transition-all"
                >
                  <Download className="h-5 w-5" /> Export
                </button>
              </div>
            </motion.div>

            {/* Action Buttons & Agents */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`${glass} p-6`}
            >
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                <Zap className="h-5 w-5 text-purple-500" /> Action Buttons & Agents
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Generate Action Plan */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Generate Action Plan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Export the recommended next steps as a downloadable action plan</p>
                  <button
                    onClick={handleGenerateActionPlan}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <FilePlus className="h-4 w-4" />
                    Generate Action Plan
                  </button>
                </div>

                {/* Send to Agent */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Send to Agent</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Delegate this analysis to an AI agent for automated execution</p>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Agent:</label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleSendToAgent}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Send to {agents.find(a => a.id === selectedAgent)?.name}
                  </button>
                </div>

                {/* Save Scenario */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Save Scenario</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Save this analysis with current parameters for future comparison</p>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                  >
                    <FilePlus className="h-4 w-4" />
                    Save Current Scenario
                  </button>
                </div>

                {/* Compare Scenarios */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Compare Scenarios</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Compare two saved scenarios side-by-side</p>
                  
                  <div className="mb-3 space-y-2">
                    <select
                      value={selectedScenario1}
                      onChange={(e) => setSelectedScenario1(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select first scenario</option>
                      {(savedScenarios || []).map((scenario) => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.name} ({new Date(scenario.timestamp).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedScenario2}
                      onChange={(e) => setSelectedScenario2(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select second scenario</option>
                      {(savedScenarios || []).map((scenario) => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.name} ({new Date(scenario.timestamp).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleCompareScenarios}
                    disabled={!selectedScenario1 || !selectedScenario2}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Compare Scenarios
                  </button>
                </div>
              </div>

              {/* Agent Modal */}
              {showAgentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Sending to {agents.find(a => a.id === selectedAgent)?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {agents.find(a => a.id === selectedAgent)?.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAgentModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowAgentModal(false);
                          setDebugInfo(prev => prev + `\nSuccessfully sent to ${agents.find(a => a.id === selectedAgent)?.name}`);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Scenario Modal */}
              {showSaveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Save Current Scenario
                    </h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scenario Name:
                      </label>
                      <input
                        type="text"
                        value={scenarioName}
                        onChange={(e) => setScenarioName(e.target.value)}
                        placeholder="Enter a name for this scenario"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSaveModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveScenario}
                        disabled={!scenarioName.trim()}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Compare Scenarios Modal */}
              {showCompareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Compare Scenarios
                      </h3>
                      <button
                        onClick={() => setShowCompareModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Scenario 1 */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {getScenarioById(selectedScenario1)?.name}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Input:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario1)?.input}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expert Mode:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario1)?.expert}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommendation:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario1)?.analysis.recommendation.bestOption}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario1)?.analysis.recommendation.confidence}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Scenario 2 */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          {getScenarioById(selectedScenario2)?.name}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Input:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario2)?.input}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expert Mode:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario2)?.expert}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommendation:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario2)?.analysis.recommendation.bestOption}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{getScenarioById(selectedScenario2)?.analysis.recommendation.confidence}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Differences */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Differences</h4>
                      <div className="space-y-2 text-sm">
                        {(getScenarioById(selectedScenario1)?.analysis.recommendation.bestOption !== getScenarioById(selectedScenario2)?.analysis.recommendation.bestOption || getScenarioById(selectedScenario1)?.analysis.recommendation.confidence !== getScenarioById(selectedScenario2)?.analysis.recommendation.confidence || getScenarioById(selectedScenario1)?.expert !== getScenarioById(selectedScenario2)?.expert) && (
                          <div className="flex items-center gap-2">
                            <span className="text-red-500">●</span>
                            <span className="text-gray-700 dark:text-gray-300">Different recommendations</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`${glass} p-6`}
            >
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                <Zap className="h-5 w-5 text-purple-500" /> Suggested Next Steps
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {Array.isArray(analysis.nextSteps) && analysis.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </motion.div>

            {/* Debug Block */}
            <div className="mt-4">
              <button
                className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2"
                onClick={() => setShowDebug(v => !v)}
              >
                {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Show Debug JSON
              </button>
              <AnimatePresence>
                {showDebug && (
                  <motion.pre
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-900 text-green-200 p-4 rounded-xl overflow-x-auto text-xs"
                  >
                    {JSON.stringify(debug || analysis, null, 2)}
                  </motion.pre>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Features Grid */}
        {!analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chain-of-Thought</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Follow the AI&apos;s reasoning process step-by-step with detailed explanations and tool usage.
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Interactive Simulation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adjust probabilities and risk levels to see how they affect recommendations in real-time.
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expert Modules</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose from specialized expert perspectives for domain-specific analysis and insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArcBrain; 