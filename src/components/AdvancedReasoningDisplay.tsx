'use client';

import { useState } from 'react';
import { 
  Brain, 
  GitBranch, 
  GitCommit, 
  TrendingUp, 
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface ThoughtNode {
  id: string;
  thought: string;
  confidence: number;
  reasoning: string;
  children?: ThoughtNode[];
  is_solution?: boolean;
}

interface ChainOfThought {
  steps: string[];
  final_reasoning: string;
  confidence: number;
}

interface TreeOfThoughts {
  root_thought: string;
  branches: ThoughtNode[];
  best_path: string[];
  final_decision: string;
  confidence: number;
}

interface AdvancedReasoningDisplayProps {
  chainOfThought: ChainOfThought;
  treeOfThoughts: TreeOfThoughts;
  combinedConfidence: number;
}

export default function AdvancedReasoningDisplay({
  chainOfThought,
  treeOfThoughts,
  combinedConfidence
}: AdvancedReasoningDisplayProps) {
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'cot' | 'tot' | 'combined'>('combined');

  const toggleBranch = (branchId: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
    }
    setExpandedBranches(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-900/30 border-green-500/30';
    if (confidence >= 60) return 'bg-yellow-900/30 border-yellow-500/30';
    return 'bg-red-900/30 border-red-500/30';
  };

  const renderThoughtNode = (node: ThoughtNode, depth: number = 0) => {
    const isExpanded = expandedBranches.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isInBestPath = treeOfThoughts.best_path.includes(node.id);

    return (
      <div key={node.id} className={`ml-${depth * 4}`}>
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
          isInBestPath 
            ? 'bg-blue-900/30 border-blue-500/30' 
            : 'bg-gray-800/50 border-gray-600/50'
        }`}>
          <div className="flex-shrink-0 mt-1">
            {hasChildren ? (
              <button
                onClick={() => toggleBranch(node.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-white">{node.thought}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceBg(node.confidence)} ${getConfidenceColor(node.confidence)}`}>
                {node.confidence}%
              </span>
              {isInBestPath && (
                <CheckCircle className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <p className="text-sm text-gray-300">{node.reasoning}</p>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-2 ml-6 border-l border-gray-600 pl-4">
            {node.children?.map(child => renderThoughtNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('combined')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'combined'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" />
            Combined Analysis
          </div>
        </button>
        <button
          onClick={() => setActiveTab('cot')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'cot'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <GitCommit className="w-4 h-4" />
            Chain of Thought
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tot')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tot'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <GitBranch className="w-4 h-4" />
            Tree of Thoughts
          </div>
        </button>
      </div>

      {/* Combined Analysis */}
      {activeTab === 'combined' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Combined Reasoning Analysis</h3>
                <p className="text-sm text-gray-300">Advanced AI reasoning with multiple approaches</p>
              </div>
              <div className="ml-auto">
                <span className={`text-lg font-bold ${getConfidenceColor(combinedConfidence)}`}>
                  {combinedConfidence}%
                </span>
                <span className="text-sm text-gray-400 ml-1">confidence</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chain of Thought Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GitCommit className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">Chain of Thought</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceBg(chainOfThought.confidence)} ${getConfidenceColor(chainOfThought.confidence)}`}>
                    {chainOfThought.confidence}%
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{chainOfThought.final_reasoning}</p>
                <div className="text-xs text-gray-400">
                  {chainOfThought.steps.length} reasoning steps
                </div>
              </div>

              {/* Tree of Thoughts Summary */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white">Tree of Thoughts</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceBg(treeOfThoughts.confidence)} ${getConfidenceColor(treeOfThoughts.confidence)}`}>
                    {treeOfThoughts.confidence}%
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{treeOfThoughts.final_decision}</p>
                <div className="text-xs text-gray-400">
                  {treeOfThoughts.branches.length} branches explored
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chain of Thought Details */}
      {activeTab === 'cot' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <GitCommit className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Chain of Thought Analysis</h3>
              <span className={`text-sm px-3 py-1 rounded-full ${getConfidenceBg(chainOfThought.confidence)} ${getConfidenceColor(chainOfThought.confidence)}`}>
                {chainOfThought.confidence}% confidence
              </span>
            </div>

            <div className="space-y-3">
              {chainOfThought.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-300">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h4 className="font-medium text-blue-300 mb-2">Final Reasoning</h4>
              <p className="text-sm text-gray-300">{chainOfThought.final_reasoning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tree of Thoughts Details */}
      {activeTab === 'tot' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Tree of Thoughts Analysis</h3>
              <span className={`text-sm px-3 py-1 rounded-full ${getConfidenceBg(treeOfThoughts.confidence)} ${getConfidenceColor(treeOfThoughts.confidence)}`}>
                {treeOfThoughts.confidence}% confidence
              </span>
            </div>

            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">Root Thought</h4>
              <p className="text-sm text-gray-300">{treeOfThoughts.root_thought}</p>
            </div>

            <div className="space-y-3">
              {treeOfThoughts.branches.map(branch => renderThoughtNode(branch))}
            </div>

            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h4 className="font-medium text-green-300 mb-2">Best Path</h4>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {treeOfThoughts.best_path.map((path, index) => (
                  <div key={index} className="flex items-center">
                    <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                      {path}
                    </span>
                    {index < treeOfThoughts.best_path.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-500 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h4 className="font-medium text-green-300 mb-2">Final Decision</h4>
              <p className="text-sm text-gray-300">{treeOfThoughts.final_decision}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 