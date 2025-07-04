// import { useEffect, useState } from "react";
import { getSupabaseServer } from '@/lib/supabase-server';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const dynamic = 'force-dynamic';

export default async function AgentAnalyticsPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  let agents: { id: string; name: string }[] = [];
  let runs: { agent_id: string; status: string }[] = [];
  if (user) {
    const { data: agentData } = await supabase
      .from('agents')
      .select('id, name')
      .eq('user_id', user.id);
    agents = agentData || [];
    const { data: runData } = await supabase
      .from('agent_runs')
      .select('agent_id, status')
      .eq('user_id', user.id);
    runs = runData || [];
  }

  // Calculate usage (runs per agent)
  const agentUsageMap: Record<string, { name: string; runs: number }> = {};
  agents.forEach(agent => {
    agentUsageMap[agent.id] = { name: agent.name, runs: 0 };
  });
  runs.forEach(run => {
    if (agentUsageMap[run.agent_id]) {
      agentUsageMap[run.agent_id].runs += 1;
    }
  });
  const agentUsageLabels = Object.values(agentUsageMap).map((a) => a.name);
  const agentUsageData = Object.values(agentUsageMap).map((a) => a.runs);

  // Calculate success/failure
  let success = 0, failure = 0;
  runs.forEach(run => {
    if (run.status === 'completed') success += 1;
    else if (run.status === 'failed') failure += 1;
  });

  const agentUsage = {
    labels: agentUsageLabels,
    datasets: [
      {
        label: 'Runs',
        data: agentUsageData,
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#3b82f6',
          '#10b981',
          '#f59e42',
          '#ef4444',
        ],
      },
    ],
  };
  const agentSuccess = {
    labels: ['Success', 'Failure'],
    datasets: [
      {
        label: 'Success Rate',
        data: [success, failure],
        backgroundColor: ['#10b981', '#ef4444'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]"></div>
      </div>
      <div className="relative z-10">
        <DashboardHeader user={user || { id: 'placeholder', email: 'user@example.com', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' }} profile={{}} />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">Agent Analytics</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#18181b] rounded-xl p-6 border border-[#333]">
                  <h2 className="text-xl font-semibold mb-4">Agent Usage</h2>
                  <Bar data={agentUsage} options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      x: { grid: { color: '#222' }, ticks: { color: '#fff' } },
                      y: { grid: { color: '#222' }, ticks: { color: '#fff' } },
                    },
                  }} />
                </div>
                <div className="bg-[#18181b] rounded-xl p-6 border border-[#333]">
                  <h2 className="text-xl font-semibold mb-4">Success Rate</h2>
                  <Pie data={agentSuccess} options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: '#fff' } },
                      title: { display: false },
                    },
                  }} />
                </div>
              </div>
              <div className="mt-12 text-center text-gray-400 text-sm">
                Showing real-time analytics for your agents.
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 