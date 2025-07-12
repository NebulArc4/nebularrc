import type { NextApiRequest, NextApiResponse } from 'next'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol, range, search } = req.query
  if (search && typeof search === 'string') {
    // Company name search
    if (!FINNHUB_API_KEY) {
      return res.status(500).json({ error: 'FINNHUB_API_KEY not set' })
    }
    try {
      const url = `${BASE_URL}/search?q=${encodeURIComponent(search)}&token=${FINNHUB_API_KEY}`
      const finRes = await fetch(url)
      if (!finRes.ok) throw new Error('Failed to search symbol')
      const data = await finRes.json()
      if (data.count > 0 && data.result && data.result[0]?.symbol) {
        return res.status(200).json({ symbol: data.result[0].symbol })
      } else {
        return res.status(404).json({ error: 'No symbol found' })
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        return res.status(500).json({ error: e.message })
      }
      return res.status(500).json({ error: 'Unknown error' })
    }
  }
  if (!symbol || typeof symbol !== 'string' || !range || typeof range !== 'string') {
    return res.status(400).json({ error: 'Missing symbol or range' })
  }
  if (!FINNHUB_API_KEY) {
    return res.status(500).json({ error: 'FINNHUB_API_KEY not set' })
  }
  try {
    const resolution = getResolution(range as 'day' | 'month' | 'year')
    const to = Math.floor(Date.now() / 1000)
    const from = getFromTimestamp(range as 'day' | 'month' | 'year')
    const url = `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    console.log('Finnhub URL:', url)
    const finRes = await fetch(url)
    const rawText = await finRes.text()
    console.log('Finnhub raw response:', rawText)
    if (!finRes.ok) throw new Error('Failed to fetch stock data')
    const data: Record<string, unknown> = JSON.parse(rawText)
    if (data.s !== 'ok') throw new Error('No data for symbol')
    if (!data["Global Quote"] || typeof data["Global Quote"] !== 'object' || typeof (data["Global Quote"] as Record<string, unknown>)["05. price"] !== 'string') throw new Error('No price data for symbol')
    const series = data["Time Series (Daily)"]
    if (!series || typeof series !== 'object') throw new Error('No historical data for symbol')
    // Get last 30 days for month, last 365 for year
    const limit = range === 'month' ? 30 : 365
    const prices = Object.entries(series as Record<string, { [key: string]: string }>)
      .slice(0, limit)
      .map(([date, val]) => ({
        time: new Date(date).getTime(),
        price: parseFloat(val["4. close"])
      }))
      .reverse() // oldest to newest
    return res.status(200).json({ prices })
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({ error: e.message })
    }
    return res.status(500).json({ error: 'Unknown error' })
  }
} 