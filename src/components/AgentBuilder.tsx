"use client"

import { useState } from "react"

export default function AgentBuilder() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [steps, setSteps] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const addStep = () => {
    setSteps([
      ...steps,
      {
        type: "extract",
        config: {},
        step_order: steps.length + 1,
        condition: "",
        memoryRead: false,
        memoryWrite: false
      }
    ])
  }

  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 })))
  }

  const updateStep = (idx: number, key: string, value: any) => {
    setSteps(
      steps.map((step, i) =>
        i === idx ? { ...step, [key]: value } : step
      )
    )
  }

  const saveAgent = async () => {
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/multi-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      })
      if (!res.ok) throw new Error("Failed to create agent")
      const agent = await res.json()
      for (const step of steps) {
        await fetch(`/api/multi-agents/${agent.id}/steps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(step)
        })
      }
      setMessage("Agent created!")
      setName("")
      setDescription("")
      setSteps([])
    } catch (e: any) {
      setMessage(e.message || "Error saving agent")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#18181b] rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-4">Create Multi-Step Agent</h1>
      <div className="mb-4">
        <label className="block font-medium mb-1">Agent Name</label>
        <input
          className="w-full px-3 py-2 rounded border bg-gray-100 dark:bg-[#23233a] text-gray-900 dark:text-white"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 rounded border bg-gray-100 dark:bg-[#23233a] text-gray-900 dark:text-white"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Steps</span>
          <button onClick={addStep} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Step</button>
        </div>
        {steps.length === 0 && <div className="text-gray-500">No steps yet.</div>}
        <ol className="space-y-2">
          {steps.map((step, idx) => (
            <li key={idx} className="flex flex-col gap-2 bg-gray-50 dark:bg-[#23233a] p-2 rounded">
              <div className="flex items-center gap-2">
                <select
                  value={step.type}
                  onChange={e => updateStep(idx, "type", e.target.value)}
                  className="px-2 py-1 rounded border bg-white dark:bg-[#23233a] text-gray-900 dark:text-white"
                >
                  <option value="extract">Extract</option>
                  <option value="summarize">Summarize</option>
                  <option value="email">Email</option>
                  <option value="web_search">Web Search</option>
                  <option value="custom">Custom</option>
                </select>
                <input
                  placeholder="Config (JSON)"
                  value={JSON.stringify(step.config)}
                  onChange={e => {
                    try {
                      updateStep(idx, "config", JSON.parse(e.target.value))
                    } catch {
                      // ignore invalid JSON
                    }
                  }}
                  className="flex-1 px-2 py-1 rounded border bg-white dark:bg-[#23233a] text-gray-900 dark:text-white"
                />
                <button onClick={() => removeStep(idx)} className="text-red-500 hover:underline">Remove</button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Condition (optional)"
                  value={step.condition || ""}
                  onChange={e => updateStep(idx, "condition", e.target.value)}
                  className="flex-1 px-2 py-1 rounded border bg-white dark:bg-[#23233a] text-gray-900 dark:text-white"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={step.memoryRead || false}
                    onChange={e => updateStep(idx, "memoryRead", e.target.checked)}
                  />
                  Read Memory
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={step.memoryWrite || false}
                    onChange={e => updateStep(idx, "memoryWrite", e.target.checked)}
                  />
                  Write Memory
                </label>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <button
        onClick={saveAgent}
        disabled={saving || !name || steps.length === 0}
        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Agent"}
      </button>
      {message && <div className="mt-4 text-center text-green-600 dark:text-green-400">{message}</div>}
    </div>
  )
} 