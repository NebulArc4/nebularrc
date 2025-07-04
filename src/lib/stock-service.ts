const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const BASE_URL = 'https://finnhub.io/api/v1'

function getResolution(range: 'day' | 'month' | 'year') {
  switch (range) {
    case 'day': return '5'; // 5-minute intervals
    case 'month': return 'D'; // Daily
    case 'year': return 'W'; // Weekly
    default: return 'D';
  }
}

function getFromTimestamp(range: 'day' | 'month' | 'year') {
  const now = Math.floor(Date.now() / 1000)
  if (range === 'day') return now - 60 * 60 * 24
  if (range === 'month') return now - 60 * 60 * 24 * 30
  if (range === 'year') return now - 60 * 60 * 24 * 365
  return now - 60 * 60 * 24 * 30
}

export async function fetchStockPrices(symbol: string, range: 'day' | 'month' | 'year') {
  const res = await fetch(`/api/stock-prices?symbol=${encodeURIComponent(symbol)}&range=${range}`)
  if (!res.ok) throw new Error('Failed to fetch stock data')
  const data = (await res.json()) as { prices?: { time: number; price: number }[]; error?: string }
  if (!data.prices) throw new Error(data.error || 'No data for symbol')
  return data.prices
} 