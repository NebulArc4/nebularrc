import { NextRequest } from 'next/server';

// Simple hardcoded document store
const DOCUMENTS = [
  {
    id: 'doc1',
    text: 'ArcBrain leverages advanced AI models to provide decision support for business, finance, and strategy.'
  },
  {
    id: 'doc2',
    text: 'Retrieval-Augmented Generation (RAG) combines LLMs with document retrieval to ground answers in real data.'
  },
  {
    id: 'doc3',
    text: 'Groq AI offers high-speed inference for large language models, making real-time analysis possible.'
  },
  {
    id: 'doc4',
    text: 'Pinecone is a vector database used for semantic search and similarity matching in AI applications.'
  },
  {
    id: 'doc5',
    text: 'OpenAI embeddings convert text into vectors for use in search and retrieval pipelines.'
  },
];

function keywordScore(text: string, query: string) {
  const queryWords = query.toLowerCase().split(/\W+/);
  let score = 0;
  for (const word of queryWords) {
    if (word && text.toLowerCase().includes(word)) score++;
  }
  return score;
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
  }

  // Score and sort passages by keyword match
  const scored = DOCUMENTS.map(doc => ({
    ...doc,
    score: keywordScore(doc.text, query)
  }))
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return new Response(JSON.stringify({ passages: scored }), { status: 200 });
} 