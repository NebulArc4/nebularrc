// Remove node-fetch import (not needed in Next.js/Node 18+)

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

// Major indices and assets to check
const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^FTSE', name: 'FTSE 100' },
  { symbol: '^GDAXI', name: 'DAX' },
  { symbol: '^FCHI', name: 'CAC 40' },
  { symbol: '^N225', name: 'Nikkei 225' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: 'GC=F', name: 'Gold' },
  { symbol: 'CL=F', name: 'Crude Oil' },
];
const VIX_SYMBOL = '^VIX';

interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t?: number; // timestamp
  [key: string]: unknown;
}

function scoreRisk(value: number, type: 'volatility' | 'change'): 'Low' | 'Medium' | 'High' {
  if (type === 'volatility') {
    if (value < 15) return 'Low';
    if (value < 25) return 'Medium';
    return 'High';
  } else {
    // For % change
    if (Math.abs(value) < 0.5) return 'Low';
    if (Math.abs(value) < 1.5) return 'Medium';
    return 'High';
  }
}

export async function getRealtimeRisk() {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY is not set');
  }

  // Fetch quote data for all indices/assets
  const quotes: (FinnhubQuote & { symbol: string; name: string })[] = await Promise.all(
    INDICES.map(async (idx) => {
      const res = await fetch(`${BASE_URL}/quote?symbol=${encodeURIComponent(idx.symbol)}&token=${FINNHUB_API_KEY}`);
      const data: FinnhubQuote = await res.json();
      return { ...idx, ...data };
    })
  );

  // Fetch VIX for volatility
  const vixRes = await fetch(`${BASE_URL}/quote?symbol=${encodeURIComponent(VIX_SYMBOL)}&token=${FINNHUB_API_KEY}`);
  const vixData: FinnhubQuote = await vixRes.json();

  // Aggregate market risk: average % change across all indices
  const avgChange = quotes.reduce((sum: number, q) => sum + (q.dp || 0), 0) / quotes.length;
  const marketRisk = scoreRisk(avgChange, 'change');

  // Volatility risk: use VIX value
  const vix = vixData.c || 0;
  const volatilityRisk = scoreRisk(vix, 'volatility');

  // Timing risk: use recent price momentum (average of last close to current)
  const avgMomentum = quotes.reduce((sum: number, q) => sum + ((q.c - q.pc) / (q.pc || 1)), 0) / quotes.length;
  const timingRisk = scoreRisk(avgMomentum * 100, 'change');

  return {
    marketRisk,
    volatilityRisk,
    timingRisk,
    live: true,
    timestamp: new Date().toISOString(),
    details: {
      avgChange,
      vix,
      avgMomentum,
      quotes,
      vixData
    }
  };
} 