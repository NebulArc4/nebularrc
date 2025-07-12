"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase-browser';

export default function ArcBrainResultPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userId = "user-123"; // TODO: Replace with real user ID from auth context

  useEffect(() => {
    async function fetchLatestAnalysis() {
      setLoading(true);
      // Fetch the latest analysis from ai_memories
      const { data, error } = await supabase
        .from('ai_memories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) {
        setAnalysis(null);
      } else if (data && data.length > 0) {
        setAnalysis(data[0]);
      } else {
        setAnalysis(null);
      }
      setLoading(false);
    }
    fetchLatestAnalysis();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">AI Analysis Result</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : analysis ? (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg mb-2">Brain Type</h2>
              <div className="mb-2">{analysis.brain_type}</div>
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-2">Predicted Impact</h2>
              <div>{analysis.predicted_impact}</div>
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-2">Predicted Recommendations</h2>
              <ul className="list-disc ml-6 space-y-1">
                {Array.isArray(analysis.predicted_recommendations) && analysis.predicted_recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-2">Predicted Risks</h2>
              <ul className="list-disc ml-6 space-y-1">
                {analysis.predicted_risks && Object.entries(analysis.predicted_risks).map(([risk, level]: [string, any], i: number) => (
                  <li key={i}><b>{risk}:</b> {level}</li>
                ))}
              </ul>
            </div>
            {/* Add more sections as needed */}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No analysis result found.<br />
            Please run an analysis from the ArcBrain dashboard.
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.push("/dashboard/arc-brain")}
          >
            Back to ArcBrain
          </button>
        </div>
      </div>
    </div>
  );
} 