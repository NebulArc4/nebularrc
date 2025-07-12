'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

interface MemoryStats {
  total_decisions: number;
  decisions_with_outcomes: number;
  average_accuracy: number;
  brain_types: string[];
}

interface OutcomeForm {
  decision_id: string;
  success_level: 'excellent' | 'good' | 'moderate' | 'poor' | 'failed';
  actual_impact: string;
  actual_results: string[];
  lessons_learned: string[];
  accuracy_score: number;
}

export default function AIMemoryStats() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState<OutcomeForm>({
    decision_id: '',
    success_level: 'moderate',
    actual_impact: '',
    actual_results: [''],
    lessons_learned: [''],
    accuracy_score: 50
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMemoryStats();
  }, []);

  const fetchMemoryStats = async () => {
    try {
      const response = await fetch('/api/arcbrain/outcome');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMemoryStats(data.memory_stats);
    } catch (error) {
      console.error('Error fetching memory stats:', error);
      setMessage('Error loading memory statistics. Please try again.');
    }
  };

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/arcbrain/outcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision_id: outcomeForm.decision_id,
          outcome: {
            ...outcomeForm,
            actual_results: outcomeForm.actual_results.filter(r => r.trim() !== ''),
            lessons_learned: outcomeForm.lessons_learned.filter(l => l.trim() !== '')
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Outcome updated successfully! AI memory has been enhanced.');
        setShowOutcomeForm(false);
        setOutcomeForm({
          decision_id: '',
          success_level: 'moderate',
          actual_impact: '',
          actual_results: [''],
          lessons_learned: [''],
          accuracy_score: 50
        });
        fetchMemoryStats(); // Refresh stats
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error submitting outcome. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayItem = (field: 'actual_results' | 'lessons_learned') => {
    setOutcomeForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field: 'actual_results' | 'lessons_learned', index: number, value: string) => {
    setOutcomeForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: 'actual_results' | 'lessons_learned', index: number) => {
    setOutcomeForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSuccessLevelIcon = (level: string) => {
    switch (level) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'moderate': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!memoryStats) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Memory Statistics */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">AI Memory Statistics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Total Decisions</span>
            </div>
            <p className="text-2xl font-bold text-white">{memoryStats.total_decisions}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">With Outcomes</span>
            </div>
            <p className="text-2xl font-bold text-white">{memoryStats.decisions_with_outcomes}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Avg Accuracy</span>
            </div>
            <p className={`text-2xl font-bold ${getAccuracyColor(memoryStats.average_accuracy)}`}>
              {memoryStats.average_accuracy.toFixed(1)}%
            </p>
          </div>
        </div>

        {memoryStats.brain_types.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-300 mb-2">Active Brain Types:</p>
            <div className="flex flex-wrap gap-2">
              {memoryStats.brain_types.map((brainType, index) => (
                <span key={index} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {brainType}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Outcome Feedback Form */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Provide Decision Outcome</h3>
          <button
            onClick={() => setShowOutcomeForm(!showOutcomeForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showOutcomeForm ? 'Cancel' : 'Add Outcome'}
          </button>
        </div>

        {showOutcomeForm && (
          <form onSubmit={handleSubmitOutcome} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Decision ID
              </label>
              <input
                type="text"
                value={outcomeForm.decision_id}
                onChange={(e) => setOutcomeForm(prev => ({ ...prev, decision_id: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the decision ID from your analysis"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Success Level
              </label>
              <select
                value={outcomeForm.success_level}
                onChange={(e) => setOutcomeForm(prev => ({ ...prev, success_level: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="moderate">Moderate</option>
                <option value="poor">Poor</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Actual Impact
              </label>
              <textarea
                value={outcomeForm.actual_impact}
                onChange={(e) => setOutcomeForm(prev => ({ ...prev, actual_impact: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the actual impact of the decision"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Actual Results
              </label>
              {outcomeForm.actual_results.map((result, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={result}
                    onChange={(e) => updateArrayItem('actual_results', index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter actual result"
                  />
                  {outcomeForm.actual_results.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('actual_results', index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('actual_results')}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Add Result
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lessons Learned
              </label>
              {outcomeForm.lessons_learned.map((lesson, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={lesson}
                    onChange={(e) => updateArrayItem('lessons_learned', index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lesson learned"
                  />
                  {outcomeForm.lessons_learned.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('lessons_learned', index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('lessons_learned')}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Add Lesson
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Accuracy Score (0-100)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={outcomeForm.accuracy_score}
                onChange={(e) => setOutcomeForm(prev => ({ ...prev, accuracy_score: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>0%</span>
                <span className={getAccuracyColor(outcomeForm.accuracy_score)}>
                  {outcomeForm.accuracy_score}%
                </span>
                <span>100%</span>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('Error') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Outcome'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 