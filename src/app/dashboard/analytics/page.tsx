"use client"

import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AgentAnalyticsPage() {
  // Mock data for now
  const [agentUsage, setAgentUsage] = useState({
    labels: ["Data Analyzer", "Summarizer", "Translator", "Code Reviewer"],
    datasets: [
      {
        label: "Runs",
        data: [12, 19, 7, 5],
        backgroundColor: [
          "#6366f1",
          "#8b5cf6",
          "#3b82f6",
          "#10b981",
        ],
      },
    ],
  });

  const [agentSuccess, setAgentSuccess] = useState({
    labels: ["Success", "Failure"],
    datasets: [
      {
        label: "Success Rate",
        data: [85, 15],
        backgroundColor: ["#10b981", "#ef4444"],
      },
    ],
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
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
          (Real analytics will appear here soon!)
        </div>
      </div>
    </div>
  );
} 