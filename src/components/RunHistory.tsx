"use client"

import { useEffect, useState } from "react"

export default function RunHistory({ agentId }: { agentId: string }) {
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedRun, setSelectedRun] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/multi-agents/${agentId}/runs`)
      .then(res => res.json())
      .then(setRuns)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [agentId])

  const deleteRun = async (runId: string) => {
    if (!window.confirm("Are you sure you want to delete this run?")) return
    setDeleting(runId)
    try {
      const res = await fetch(`/api/multi-agents/runs/${runId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete run")
      setRuns(runs.filter(r => r.id !== runId))
      if (selectedRun?.id === runId) setSelectedRun(null)
    } catch (e: any) {
      setError(e.message || "Error deleting run")
    } finally {
      setDeleting(null)
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
    <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-[#18181b] rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-4">Agent Run History</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left mb-6">
          <thead>
            <tr>
              <th className="py-2">Run ID</th>
              <th className="py-2">Status</th>
              <th className="py-2">Started</th>
              <th className="py-2">Finished</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run.id} className="border-b hover:bg-gray-50 dark:hover:bg-[#23233a] cursor-pointer">
                <td className="py-2" onClick={() => setSelectedRun(run)}>{run.id.slice(0, 8)}...</td>
                <td className="py-2 capitalize">{run.status}</td>
                <td className="py-2">{run.started_at ? new Date(run.started_at).toLocaleString() : '-'}</td>
                <td className="py-2">{run.finished_at ? new Date(run.finished_at).toLocaleString() : '-'}</td>
                <td className="py-2">
                  <button
                    onClick={e => { e.stopPropagation(); deleteRun(run.id) }}
                    disabled={deleting === run.id}
                    className="text-red-500 hover:underline disabled:opacity-50"
                  >
                    {deleting === run.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedRun && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-[#23233a] rounded-xl">
          <h2 className="text-lg font-bold mb-2">Run Details</h2>
          <div className="mb-2">Run ID: {selectedRun.id}</div>
          <div className="mb-2">Status: <span className="capitalize">{selectedRun.status}</span></div>
          <div className="mb-2">Started: {selectedRun.started_at ? new Date(selectedRun.started_at).toLocaleString() : '-'}</div>
          <div className="mb-2">Finished: {selectedRun.finished_at ? new Date(selectedRun.finished_at).toLocaleString() : '-'}</div>
          <div className="mb-2">Step Results:</div>
          <ol className="space-y-2">
            {(selectedRun.step_results || []).map((r: any, idx: number) => (
              <li key={idx} className="p-3 rounded bg-white dark:bg-[#18181b] border">
                <div className="font-semibold">Step {idx + 1}: {r.type}</div>
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
          {selectedRun.status === "completed" && selectedRun.step_results?.length > 0 && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleDownloadPDF(selectedRun.step_results[selectedRun.step_results.length - 1].result, 'final-result.pdf')}
                className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
              >
                Download Final Result as PDF
              </button>
              <button
                onClick={() => handleDownloadJSON(selectedRun.step_results[selectedRun.step_results.length - 1].result, 'final-result.json')}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Download Final Result as JSON
              </button>
            </div>
          )}
          <button onClick={() => setSelectedRun(null)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Close</button>
        </div>
      )}
    </div>
  )
} 