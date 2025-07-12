export function buildRAGPrompt(query: string, passages: {text: string, id: string}[]) {
  const context = passages.map((p, i) => `[${i+1}] ${p.text} (Source: ${p.id})`).join('\n');
  return `
You are an expert decision support AI. Use the following context to answer the user's question. Cite the sources in your answer.

Context:
${context}

User Question: ${query}
`;
}

export async function getGroqAnswer(prompt: string) {
  const response = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
} 