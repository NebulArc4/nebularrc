"use client"

import { useEffect, useState, useRef } from "react"
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function AgentRunner({ agentId }: { agentId: string }) {
  const [agent, setAgent] = useState<any>(null)
  const [steps, setSteps] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [run, setRun] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch(`/api/multi-agents/${agentId}`)
      .then(res => res.json())
      .then(setAgent)
    fetch(`/api/multi-agents/${agentId}/steps`)
      .then(res => res.json())
      .then(setSteps)
  }, [agentId])

  // Poll for run status/results
  useEffect(() => {
    if (!run?.id) return
    function poll() {
      fetch(`/api/multi-agents/${agentId}/runs`)
        .then(res => res.json())
        .then((runs) => {
          const thisRun = runs.find((r: any) => r.id === run.id)
          if (thisRun) {
            setRun(thisRun)
            setResults(
              (thisRun.step_results || []).map((r: any, idx: number) => ({
                ...r,
                step: steps.find((s: any) => s.id === r.step_id) || { type: r.type }
              }))
            )
            if (thisRun.status === "completed" || thisRun.status === "error") {
              if (pollInterval.current) clearInterval(pollInterval.current)
            }
          }
        })
    }
    poll()
    pollInterval.current = setInterval(poll, 2000)
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [run?.id, agentId, steps])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setFileUrl("")
    if (f) {
      setUploading(true)
      setError("")
      const filePath = `agent-inputs/${Date.now()}-${f.name}`
      const { data, error } = await supabaseBrowser.storage.from('uploads').upload(filePath, f)
      if (error) {
        setError("File upload failed: " + error.message)
        setUploading(false)
        return
      }
      const { data: publicUrl } = supabaseBrowser.storage.from('uploads').getPublicUrl(filePath)
      setFileUrl(publicUrl?.publicUrl || "")
      setUploading(false)
    }
  }

  const runAgent = async () => {
    setLoading(true)
    setError("")
    setResults([])
    try {
      const inputToSend = fileUrl || input
      if (!inputToSend) throw new Error("Please provide input text or upload a file.")
      const res = await fetch(`/api/multi-agents/${agentId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputToSend })
      })
      if (!res.ok) throw new Error("Failed to start run")
      const runData = await res.json()
      setRun(runData)
      setResults([])
    } catch (e: any) {
      setError(e.message || "Error running agent")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (result: any, filename: string) => {
    if (typeof window === 'undefined') return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    doc.text(text, 10, 10);
    doc.save(filename);
  };

  const handleDownloadJSON = (result: any, filename: string) => {
    const blob = new Blob([
      typeof result === 'string' ? result : JSON.stringify(result, null, 2)
    ], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#18181b] rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-4">Run Agent</h1>
      {agent && <div className="mb-2 text-lg font-semibold">{agent.name}</div>}
      {agent && <div className="mb-4 text-gray-500">{agent.description}</div>}
      <div className="mb-4">
        <label className="block font-medium mb-1">Input</label>
        <input
          className="w-full px-3 py-2 rounded border bg-gray-100 dark:bg-[#23233a] text-gray-900 dark:text-white mb-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter input (text or file URL)"
          disabled={uploading}
        />
        <div className="flex items-center gap-2 mt-2">
          <input type="file" accept=".pdf" onChange={handleFileChange} disabled={uploading} />
          {uploading && <span className="text-indigo-600">Uploading...</span>}
          {fileUrl && <span className="text-green-600">File uploaded!</span>}
        </div>
      </div>
      <button
        onClick={runAgent}
        disabled={loading || uploading || (!input && !fileUrl)}
        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 mb-4"
      >
        {loading ? "Running..." : "Run Agent"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Step Results</h2>
          <ol className="space-y-2">
            {results.map((r, idx) => (
              <li key={idx} className="p-3 rounded bg-gray-50 dark:bg-[#23233a]">
                <div className="font-semibold">Step {idx + 1}: {r.step.type}</div>
                <div>Status: <span className="capitalize">{r.status}</span></div>
                {r.result && (
                  <div>
                    Result: <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(r.result, null, 2)}</pre>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleDownloadPDF(r.result, `step-${idx + 1}.pdf`)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                      >
                        Download as PDF
                      </button>
                      <button
                        onClick={() => handleDownloadJSON(r.result, `step-${idx + 1}.json`)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                      >
                        Download as JSON
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {/* Final result download (last step) */}
          {run?.status === "completed" && results.length > 0 && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleDownloadPDF(results[results.length - 1].result, 'final-result.pdf')}
                className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
              >
                Download Final Result as PDF
              </button>
              <button
                onClick={() => handleDownloadJSON(results[results.length - 1].result, 'final-result.json')}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Download Final Result as JSON
              </button>
            </div>
          )}
          {run?.status === "completed" && <div className="mt-4 text-green-600 font-bold">Agent run completed!</div>}
          {run?.status === "error" && <div className="mt-4 text-red-600 font-bold">Agent run failed.</div>}
        </div>
      )}
    </div>
  )
} 