import fetch from 'node-fetch';

const NEWS_API_KEY = process.env.NEWSAPI_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

export class NewsService {
  async getTopHeadlines({ category = 'general', country = 'us', q = '' }: { category?: string; country?: string; q?: string }) {
    if (!NEWS_API_KEY) throw new Error('Missing NEWSAPI_KEY in environment');
    const url = `${NEWS_API_URL}?country=${country}&category=${category}&q=${encodeURIComponent(q)}&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
    const data = await res.json();
    return data.articles || [];
  }
}

export const newsService = new NewsService(); 