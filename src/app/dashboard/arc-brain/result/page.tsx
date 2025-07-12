"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase-browser';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@mui/material';

const severityColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
};

const trendIcons = {
  up: <ArrowTrendingUpIcon className="w-4 h-4 inline text-green-500" />,
  down: <ArrowTrendingDownIcon className="w-4 h-4 inline text-red-500" />,
  stable: <MinusCircleIcon className="w-4 h-4 inline text-gray-400" />,
};

export default function ArcBrainResultPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userId = "user-123"; // TODO: Replace with real user ID from auth context

  useEffect(() => {
    async function fetchLatestAnalysis() {
      setLoading(true);
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

  // Helper for severity badge
  function SeverityBadge({ severity }: { severity: string }) {
    const color = severityColors[severity as keyof typeof severityColors] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{severity}</span>;
  }

  // Helper for trend icon
  function TrendIcon({ trend }: { trend?: string }) {
    if (!trend) return null;
    return trendIcons[trend as keyof typeof trendIcons] || null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-blue-300">AI Analysis Result</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : analysis ? (
          <div className="space-y-8">
            {/* KPIs Section */}
            {Array.isArray(analysis.kpis) && analysis.kpis.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">Key Performance Indicators (KPIs)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.kpis.map((kpi: any, i: number) => (
                    <div key={i} className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{kpi.name}</div>
                        <div className="text-2xl font-bold">{kpi.value}{kpi.unit ? ` ${kpi.unit}` : ''} <TrendIcon trend={kpi.trend} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Recommendations Section */}
            {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">AI Recommendations</h2>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-lg">{rec.recommendation}</div>
                        <Tooltip title={`Confidence: ${rec.confidence}%`}><span className="ml-2 text-blue-600 font-semibold">{rec.confidence}%</span></Tooltip>
                      </div>
                      {rec.kpis && rec.kpis.length > 0 && (
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">KPIs: {rec.kpis.join(', ')}</div>
                      )}
                      {rec.rationale && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">AI Rationale: {rec.rationale}</div>
                      )}
                      {rec.tags && rec.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">{rec.tags.map((tag: string, j: number) => <span key={j} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{tag}</span>)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Risks Section */}
            {analysis.risk_assessment && Object.keys(analysis.risk_assessment).length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">Risk Assessment</h2>
                <div className="space-y-3">
                  {Object.entries(analysis.risk_assessment).map(([risk, details]: [string, any], i) => (
                    <div key={i} className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{risk}</div>
                        <SeverityBadge severity={details.severity} />
                      </div>
                      <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{details.description}</div>
                      <div className="mt-1 text-xs text-gray-500">Confidence: {details.confidence}%</div>
                      {details.rationale && (
                        <div className="mt-1 text-xs text-gray-400">AI Rationale: {details.rationale}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Scenario Analysis Section */}
            {Array.isArray(analysis.scenario_analysis) && analysis.scenario_analysis.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">Scenario Analysis</h2>
                <div className="space-y-3">
                  {analysis.scenario_analysis.map((sc: any, i: number) => (
                    <div key={i} className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{sc.scenario}</div>
                        <Tooltip title={`Probability: ${sc.probability}%`}><span className="ml-2 text-yellow-700 font-semibold">{sc.probability}%</span></Tooltip>
                      </div>
                      <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Projected Outcome: {sc.projected_outcome}</div>
                      {sc.kpis && sc.kpis.length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">KPIs: {sc.kpis.join(', ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Technical Analysis Section */}
            {analysis.technical_analysis && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">Technical Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Feasibility Assessment</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.technical_analysis.feasibility_assessment?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Technical Risks</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.technical_analysis.technical_risks?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Implementation Complexity</div>
                    <div className="text-sm">{analysis.technical_analysis.implementation_complexity}</div>
                  </div>
                  <div>
                    <div className="font-medium">Technology Recommendations</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.technical_analysis.technology_recommendations?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* Strategic Insights Section */}
            {analysis.strategic_insights && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">Strategic Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Market Positioning</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.strategic_insights.market_positioning?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Competitive Analysis</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.strategic_insights.competitive_analysis?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Strategic Advantages</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.strategic_insights.strategic_advantages?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Long-term Implications</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.strategic_insights.long_term_implications?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* Financial Analysis Section */}
            {analysis.financial_analysis && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">Financial Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Cost-Benefit Breakdown</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.financial_analysis.cost_benefit_breakdown?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">ROI Projections</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.financial_analysis.roi_projections?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Financial Risks</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.financial_analysis.financial_risks?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Funding Considerations</div>
                    <ul className="list-disc ml-6 text-sm">
                      {analysis.financial_analysis.funding_considerations?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {/* Reasoning Steps Section */}
            {Array.isArray(analysis.reasoning_steps) && analysis.reasoning_steps.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2 flex items-center">AI Reasoning Steps</h2>
                <ul className="list-decimal ml-6 text-sm">
                  {analysis.reasoning_steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                </ul>
              </div>
            )}
            {/* Estimated Impact, Next Steps, Success Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h2 className="font-semibold text-lg mb-2">Estimated Impact</h2>
                <div className="text-sm">{analysis.estimated_impact}</div>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Next Steps</h2>
                <ul className="list-disc ml-6 text-sm">
                  {Array.isArray(analysis.next_steps) && analysis.next_steps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                </ul>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">Success Metrics</h2>
                <ul className="list-disc ml-6 text-sm">
                  {Array.isArray(analysis.success_metrics) && analysis.success_metrics.map((metric: string, i: number) => <li key={i}>{metric}</li>)}
                </ul>
              </div>
            </div>
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