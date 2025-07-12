'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  ArrowRight, 
  Play, 
  RefreshCw, 
  XCircle,
  Plus,
  BarChart3
} from 'lucide-react';
import AIMemoryStats from '@/components/AIMemoryStats';
import { useRef } from 'react';

interface DecisionForm {
  title: string;
  category: string;
  problemStatement: string;
  desiredOutcome: string;
  timeline: string;
  budget: string;
  priority: string;
  constraints: string[];
  stakeholders: string[];
}

const categories = [
  { id: 'strategy', label: 'Strategy', color: 'bg-blue-900/50 text-blue-300' },
  { id: 'finance', label: 'Finance', color: 'bg-green-900/50 text-green-300' },
  { id: 'product', label: 'Product', color: 'bg-purple-900/50 text-purple-300' },
  { id: 'execution', label: 'Execution', color: 'bg-orange-900/50 text-orange-300' },
  { id: 'personal', label: 'Personal', color: 'bg-pink-900/50 text-pink-300' },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-600 text-white' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-600 text-white' },
  { value: 'high', label: 'High', color: 'bg-orange-600 text-white' },
  { value: 'critical', label: 'Critical', color: 'bg-red-600 text-white' },
];

export default function ArcBrainPage() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'memory'>('analyze');
  const [form, setForm] = useState<DecisionForm>({
    title: '',
    category: 'strategy',
    problemStatement: '',
    desiredOutcome: '',
    timeline: '',
    budget: '',
    priority: 'medium',
    constraints: [''],
    stakeholders: [''],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{file: File, status: 'pending' | 'uploading' | 'uploaded' | 'error', progress: number, serverId?: string, error?: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof DecisionForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'constraints' | 'stakeholders', index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'constraints' | 'stakeholders') => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'constraints' | 'stakeholders', index: number) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const uploadFile = async (file: File, idx: number) => {
    setUploadedFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'uploading' as const, progress: 0 } : f));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/arcbrain/documents');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadedFiles(prev => prev.map((f, i) => i === idx ? { ...f, progress: percent } : f));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          setUploadedFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'uploaded' as const, serverId: res.id, progress: 100 } : f));
        } else {
          setUploadedFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'error' as const, error: xhr.statusText } : f));
        }
      };
      xhr.onerror = () => {
        setUploadedFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'error' as const, error: 'Upload failed' } : f));
      };
      xhr.send(formData);
    } catch (err) {
      setUploadedFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'error' as const, error: 'Upload failed' } : f));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const newFiles = files.map(file => ({ file, status: 'pending' as const, progress: 0 }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach((f, idx) => uploadFile(f.file, uploadedFiles.length + idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map(file => ({ file, status: 'pending' as const, progress: 0 }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach((f, idx) => uploadFile(f.file, uploadedFiles.length + idx));
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyze = async () => {
    if (!form.title || !form.problemStatement) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const response = await fetch('/api/arcbrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: form.title,
          problem_context: form.problemStatement,
          desired_outcome: form.desiredOutcome,
          constraints: form.constraints,
          stakeholders: form.stakeholders,
          deadline: form.timeline,
          budget_range: form.budget,
          expert: form.category,
          priority: form.priority,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to analyze decision');
      }
      const result = await response.json();
      // Store only the AIAnalysis object in localStorage for the results page
      localStorage.setItem('arcBrainAnalysis', JSON.stringify(result));
      window.location.href = '/dashboard/arc-brain/result';
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze decision. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Arc Brain</h1>
              <p className="text-gray-300">Unified Decision Intelligence Platform</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analyze'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Brain className="w-4 h-4" />
                Analyze Decision
              </div>
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'memory'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                AI Memory
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analyze' ? (
          <>
            {/* Document Upload Area */}
            <div className="mb-2">
              <label className="block text-white font-semibold mb-2">Supporting Documents</label>
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-blue-500 rounded-lg bg-gray-800 py-8 px-4 cursor-pointer transition hover:border-blue-400 hover:bg-gray-700"
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.csv"
                />
                <div className="flex flex-col items-center">
                  <Plus className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-gray-300">Drag & drop files here, or <span className="underline text-blue-400">click to browse</span></span>
                  <span className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT, CSV supported</span>
                </div>
              </div>
              {uploadedFiles.length > 0 && (
                <ul className="mt-4 space-y-2 w-full max-w-lg mx-auto">
                  {uploadedFiles.map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2 text-gray-200">
                      <div className="flex flex-col flex-1">
                        <span className="truncate max-w-xs">{f.file.name}</span>
                        <div className="h-2 w-full bg-gray-600 rounded mt-1">
                          <div className={`h-2 rounded ${f.status === 'error' ? 'bg-red-500' : f.status === 'uploaded' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${f.progress}%` }} />
                        </div>
                        {f.status === 'error' && <span className="text-xs text-red-400">{f.error}</span>}
                      </div>
                      <button
                        className="ml-4 text-red-400 hover:text-red-600"
                        onClick={() => handleRemoveFile(idx)}
                        type="button"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* AI-Powered Analysis Card */}
            <div className="max-w-xl mx-auto mb-4">
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Analysis</h2>
                <p className="text-gray-300 mb-6 text-center">Get comprehensive analysis with technical, strategic, and financial insights</p>
                <button onClick={handleAnalyze} disabled={isAnalyzing || !form.title || !form.problemStatement} className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 text-lg transition hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      Analyze Decision
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Input Form */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Decision Input
              </h2>
              <div className="space-y-6">
                {/* Title & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="peer w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-transparent"
                      placeholder=" "
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
                      Decision Title
                    </label>
                  </div>

                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-700 text-white"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="relative">
                  <textarea
                    value={form.problemStatement}
                    onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                    rows={4}
                    className="peer w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-700 text-white placeholder-transparent"
                    placeholder=" "
                  />
                  <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
                    Problem Statement
                  </label>
                </div>

                {/* Desired Outcome */}
                <div className="relative">
                  <textarea
                    value={form.desiredOutcome}
                    onChange={(e) => handleInputChange('desiredOutcome', e.target.value)}
                    rows={3}
                    className="peer w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-700 text-white placeholder-transparent"
                    placeholder=" "
                  />
                  <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
                    Desired Outcome
                  </label>
                </div>

                {/* Timeline, Budget, Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={form.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      className="peer w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-transparent"
                      placeholder=" "
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
                      Timeline
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={form.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="peer w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-transparent"
                      placeholder=" "
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base">
                      Budget
                    </label>
                  </div>

                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-700 text-white"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Constraints
                  </label>
                  {form.constraints.map((constraint, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) => handleArrayChange('constraints', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                        placeholder="Enter constraint"
                      />
                      {form.constraints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('constraints', index)}
                          className="px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('constraints')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Constraint
                  </button>
                </div>

                {/* Stakeholders */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Stakeholders
                  </label>
                  {form.stakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={stakeholder}
                        onChange={(e) => handleArrayChange('stakeholders', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                        placeholder="Enter stakeholder"
                      />
                      {form.stakeholders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('stakeholders', index)}
                          className="px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('stakeholders')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Stakeholder
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AIMemoryStats />
          </motion.div>
        )}
      </div>
    </div>
  );
} 