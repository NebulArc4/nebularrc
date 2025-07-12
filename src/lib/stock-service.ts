export async function fetchStockPrices(symbol: string, range: 'day' | 'month' | 'year') {
  const res = await fetch(`/api/stock-prices?symbol=${encodeURIComponent(symbol)}&range=${range}`)
  if (!res.ok) throw new Error('Failed to fetch stock data')
  const data = (await res.json()) as { prices?: { time: number; price: number }[]; error?: string }
  if (!data.prices) throw new Error(data.error || 'No data for symbol')
  return data.prices
} 