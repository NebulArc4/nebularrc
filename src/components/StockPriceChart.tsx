"use client"

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { fetchStockPrices } from "@/lib/stock-service";
import { usePreferences } from './PreferencesContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const ranges = [
  { label: "1 Day", value: "day" },
  { label: "1 Month", value: "month" },
  { label: "1 Year", value: "year" },
];

interface StockPriceChartProps {
  symbol?: string;
}

export default function StockPriceChart({ symbol: propSymbol }: StockPriceChartProps) {
  const { prefs } = usePreferences();
  const chartType = prefs.chartType;
  const [symbol, setSymbol] = useState(propSymbol || "AAPL");
  const [input, setInput] = useState(propSymbol || "AAPL");
  const [range, setRange] = useState<"day" | "month" | "year">("month");
  const [data, setData] = useState<{ time: number; price: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propSymbol) setSymbol(propSymbol);
  }, [propSymbol]);

  const fetchData = async (sym = symbol, rng = range) => {
    setLoading(true);
    setError(null);
    try {
      const prices = await fetchStockPrices(sym, rng);
      setData(prices);
    } catch (e: any) {
      setError(e.message || "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, range]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSymbol(input.trim().toUpperCase());
  };

  const chartData = {
    labels: data.map((d) => d.time),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map((d) => d.price),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit:
            range === 'day'
              ? 'hour'
              : range === 'month'
              ? 'day'
              : 'month',
          tooltipFormat: range === 'day' ? 'MMM d, HH:mm' : 'MMM d, yyyy',
        } as { unit: 'hour' | 'day' | 'month'; tooltipFormat: string },
        grid: { color: '#222' },
        ticks: { color: '#fff' },
      },
      y: {
        grid: { color: '#222' },
        ticks: { color: '#fff' },
      },
    },
  };

  return (
    <div className="bg-[#18181b] rounded-xl p-6 border border-[#333] max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-white">Stock Price Chart</h2>
      {!propSymbol && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            className="px-3 py-2 rounded border border-gray-700 bg-[#232336] text-white focus:ring-2 focus:ring-[#6366f1]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter symbol (e.g. AAPL)"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-[#5b21b6] hover:to-[#6366f1] transition-all duration-200"
          >
            Search
          </button>
        </form>
      )}
      <select
        className="px-2 py-2 rounded border border-gray-700 bg-[#232336] text-white mb-4"
        value={range}
        onChange={(e) => setRange(e.target.value as any)}
      >
        {ranges.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-400 py-8 text-center">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-gray-400 py-8 text-center">No data available.</div>
      ) : (
        <Line data={chartData} options={chartOptions} height={320} />
      )}
    </div>
  );
}

export async function searchSymbolByCompanyName(name: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/stock-prices?search=${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.symbol) return data.symbol;
    return null;
  } catch {
    return null;
  }
} 