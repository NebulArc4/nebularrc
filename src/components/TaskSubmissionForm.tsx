'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { taskTemplates, getTemplatesByCategory, getCategories, TaskTemplate } from '@/lib/task-templates'
import { modelManager, AIModel } from '@/lib/model-manager'
import toast, { Toaster } from 'react-hot-toast'

export interface TaskSubmissionFormProps {
  user: User
  onSuccess?: () => void
}

const TaskSubmissionForm: React.FC<TaskSubmissionFormProps> = ({ user, onSuccess }) => {
  const [taskPrompt, setTaskPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTaskType, setSelectedTaskType] = useState<string>('general')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [linkInput, setLinkInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [pdfExtractedText, setPdfExtractedText] = useState<string>('')
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const taskTypes = [
    { id: 'general', name: 'General', description: 'General AI assistance' },
    { id: 'analysis', name: 'Data Analysis', description: 'Analyze data and provide insights' },
    { id: 'summarization', name: 'Summarization', description: 'Create concise summaries' },
    { id: 'translation', name: 'Translation', description: 'Translate between languages' },
    { id: 'code_review', name: 'Code Review', description: 'Review and improve code' },
    { id: 'insights', name: 'Insights', description: 'Generate insights and recommendations' }
  ]

  const categories = getCategories()
  const availableModels = modelManager.getAvailableModels()

  useEffect(() => {
    // Set default model
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0])
    }
  }, [availableModels, selectedModel])

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setTaskPrompt(template.prompt)
    setSelectedModel(modelManager.getModelById(template.suggestedModel) || availableModels[0])
    setShowTemplates(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setPdfFile(file)
    if (file) {
      const text = await extractTextFromPDF(file)
      setPdfExtractedText(text)
      setTaskPrompt(text)
      setShowPdfPreview(true)
    } else {
      setPdfExtractedText('')
      setShowPdfPreview(false)
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (typeof window === 'undefined') return ''
    
    const pdfjsLib = await import('pdfjs-dist')
    // Set worker source dynamically
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    return text.trim()
  }

  const handleRemovePdf = () => {
    setPdfFile(null)
    setPdfExtractedText('')
    setShowPdfPreview(false)
  }

  const handleLinkInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!taskPrompt.trim()) {
      toast.error('Please enter a task prompt.')
      setLoading(false)
      return
    }

    let inputPrompt = taskPrompt.trim()
    if (linkInput) {
      inputPrompt = `LINK:${linkInput}`
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_prompt: inputPrompt,
          model: selectedModel?.id || 'llama3-8b-8192',
          category: selectedTemplate?.category || 'other',
          complexity: selectedTemplate?.complexity || 'medium',
          estimated_tokens: selectedTemplate?.estimatedTokens || 500,
          task_type: selectedTaskType,
          pdf: pdfFile ? true : false,
          link: linkInput || undefined
        }),
      })

      if (response.ok) {
        setTaskPrompt('')
        setSelectedTemplate(null)
        const data = await response.json()
        setResult(data.task?.result || null)
        toast.success('Task submitted successfully!')
        if (onSuccess) onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit task.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (result?: string) => {
    if (typeof window === 'undefined') return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.text(result || '', 10, 10);
    doc.save('ai-task-result.pdf');
  }

  const handleDownloadAnnotatedPDF = async () => {
    if (!result || !pdfFile || typeof window === 'undefined') return
    
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
    const existingPdfBytes = await pdfFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 12
    const lines = result.split('\n')
    let y = height - 40
    for (const line of lines) {
      page.drawText(line, { x: 40, y, size: fontSize, font, color: rgb(0, 0, 0) })
      y -= fontSize + 4
      if (y < 40) break // avoid overflow
    }
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'annotated-result.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredTemplates = selectedCategory === 'all' 
    ? taskTemplates.filter(t => 
        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(templateSearch.toLowerCase())
      )
    : getTemplatesByCategory(selectedCategory).filter(t => 
        t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(templateSearch.toLowerCase())
      )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      await handleFileChange({ target: { files: [file] } } as any)
    } else {
      setError('Please upload a valid PDF file.')
    }
  }

  return (
    <div className="bg-gray-50/90 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <Toaster position="top-right" />
      {/* PDF Upload Section - always visible at the top */}
      <div
        className={`mb-6 border-2 border-dashed rounded-xl transition-all duration-200 ${dragActive ? 'border-[#6366f1] bg-[#6366f1]/10' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#23233a]/40'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="block text-sm font-bold text-[#6366f1] mb-2 flex items-center px-4 pt-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Drag & drop a PDF or click to upload (optional)
        </label>
        {showPdfPreview ? (
          <div className="flex items-start space-x-4 px-4 pb-4">
            <textarea
              value={pdfExtractedText}
              onChange={(e) => setPdfExtractedText(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              placeholder="Extracted text..."
              required={false}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleRemovePdf}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 mt-2"
            >
              Remove PDF
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 bg-transparent border-none focus:outline-none"
          />
        )}
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit AI Task</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1.5 text-sm bg-[#6366f1]/20 hover:bg-[#6366f1]/30 text-[#6366f1] rounded-lg transition-colors"
          >
            {showTemplates ? 'Hide' : 'Show'} Templates
          </button>
          <button
            type="button"
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="px-3 py-1.5 text-sm bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#8b5cf6] rounded-lg transition-colors"
          >
            {showModelSelector ? 'Hide' : 'Show'} Models
          </button>
        </div>
      </div>

      {/* Task Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Task Type</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {taskTypes.map(taskType => (
            <button
              key={taskType.id}
              type="button"
              onClick={() => setSelectedTaskType(taskType.id)}
              className={`p-3 rounded-lg border transition-colors text-left ${
                selectedTaskType === taskType.id
                  ? 'bg-[#6366f1]/20 border-[#6366f1] text-[#6366f1] dark:text-white'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
              }`}
            >
              <div className="font-medium text-sm">{taskType.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{taskType.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Task Templates */}
      {showTemplates && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-[#18181b] rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-[#23233a] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:bg-gray-100 dark:focus:bg-[#23233a]"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="p-3 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700/70 rounded-lg cursor-pointer transition-colors border border-gray-200 dark:border-gray-600 hover:border-[#6366f1]/50"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{template.name}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.complexity === 'low' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                    template.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {template.complexity}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">{template.estimatedTokens} tokens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Selector */}
      {showModelSelector && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Select AI Model</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableModels.map(model => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                  selectedModel?.id === model.id
                    ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]'
                    : 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{model.name}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    model.quality === 'high' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                    model.quality === 'medium' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {model.quality}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">{model.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{model.speed}</span>
                  <span>{model.costPerToken === 0 ? 'Free' : `$${model.costPerToken}/token`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="mb-4 p-3 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[#6366f1] font-semibold">Using Template: {selectedTemplate.name}</h4>
            <button
              onClick={() => {
                setSelectedTemplate(null)
                setTaskPrompt('')
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm"
            >
              Clear
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedTemplate.description}</p>
        </div>
      )}

      {/* Selected Model Info */}
      {selectedModel && (
        <div className="mb-4 p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-[#8b5cf6] font-semibold">Selected Model: {selectedModel.name}</h4>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{selectedModel.provider}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Prompt
          </label>
          <textarea
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
            placeholder="Describe your AI task..."
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#6366f1] hover:bg-[#6366f1]/80 text-white rounded-lg transition-colors flex items-center justify-center disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : 'Submit Task'}
        </button>
      </form>

      {/* Input for link */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter Link
        </label>
        <input
          type="text"
          value={linkInput}
          onChange={handleLinkInput}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
          placeholder="Enter a link..."
        />
      </div>

      {/* Result area */}
      {result && (
        <div className="mt-4 p-3 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[#6366f1] font-semibold">Task Result</h4>
            <button
              onClick={() => handleDownloadPDF(result)}
              className="text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#6366f1] hover:to-[#6366f1] text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Download as PDF
            </button>
          </div>
          <button
            onClick={handleDownloadAnnotatedPDF}
            className="text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#6366f1] hover:to-[#6366f1] text-sm font-semibold px-4 py-2 rounded-lg transition mt-2"
          >
            Download Annotated PDF
          </button>
          <pre className="text-gray-700 dark:text-gray-300 text-sm">{result}</pre>
        </div>
      )}

      {error && <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 mb-4 animate-fade-in">{error}</div>}
      {success && <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-2 mb-4 animate-fade-in">{success}</div>}
    </div>
  )
}

export default TaskSubmissionForm
