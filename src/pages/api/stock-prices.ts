import type { NextApiRequest, NextApiResponse } from 'next'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY
const BASE_URL = 'https://finnhub.io/api/v1'
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

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
    // Company name search (not supported by Alpha Vantage free tier)
    return res.status(400).json({ error: 'Company name search not supported with Alpha Vantage free API' })
  }
  if (!symbol || typeof symbol !== 'string' || !range || typeof range !== 'string') {
    return res.status(400).json({ error: 'Missing symbol or range' })
  }
  if (!ALPHA_VANTAGE_API_KEY) {
    return res.status(500).json({ error: 'ALPHA_VANTAGE_API_KEY not set' })
  }
  try {
    let url = ''
    if (range === 'day') {
      // Use GLOBAL_QUOTE for latest price
      url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      console.log('Alpha Vantage URL:', url)
      const avRes = await fetch(url)
      const rawText = await avRes.text()
      console.log('Alpha Vantage raw response:', rawText)
      const data = JSON.parse(rawText)
      if (!data["Global Quote"] || !data["Global Quote"]["05. price"]) throw new Error('No price data for symbol')
      const price = parseFloat(data["Global Quote"]["05. price"])
      const time = Date.now()
      return res.status(200).json({ prices: [{ time, price }] })
    } else {
      // Use TIME_SERIES_DAILY for month/year
      url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`
      console.log('Alpha Vantage URL:', url)
      const avRes = await fetch(url)
      const rawText = await avRes.text()
      console.log('Alpha Vantage raw response:', rawText)
      const data = JSON.parse(rawText)
      if (!data["Time Series (Daily)"]) throw new Error(data["Note"] || 'No historical data for symbol')
      const series = data["Time Series (Daily)"]
      // Get last 30 days for month, last 365 for year
      const limit = range === 'month' ? 30 : 365
      const prices = Object.entries(series)
        .slice(0, limit)
        .map(([date, val]: [string, any]) => ({
          time: new Date(date).getTime(),
          price: parseFloat(val["4. close"])
        }))
        .reverse() // oldest to newest
      return res.status(200).json({ prices })
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Unknown error' })
  }
} 