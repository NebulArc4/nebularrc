import { groq } from '@ai-sdk/groq'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { encode } from '@msgpack/msgpack'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Decision-focused system message for JSON output
    const enhancedMessages = [
      {
        role: 'system' as const,
        content: `You are an AI decision assistant. Output ONLY a single valid JSON object, nothing else. No markdown, no explanations, no extra text.\n\nSCHEMA:\n{\n  "query": "user's decision question",\n  "analysis": "detailed analysis of the decision context, factors, and implications",\n  "options": [\n    {\n      "name": "specific option name",\n      "pros": ["key advantage 1", "key advantage 2", "key advantage 3"],\n      "cons": ["key disadvantage 1", "key disadvantage 2"],\n      "probability": 85,\n      "riskLevel": "Low/Medium/High"\n    }\n  ],\n  "recommendation": {\n    "bestOption": "recommended option name",\n    "rationale": "detailed explanation of why this option is best, considering all factors",\n    "confidence": 85\n  },\n  "nextSteps": ["specific actionable step 1", "specific actionable step 2", "specific actionable step 3"],\n  "riskAssessment": {\n    "marketRisk": "Low/Medium/High",\n    "volatilityRisk": "Low/Medium/High", \n    "timingRisk": "Low/Medium/High"\n  },\n  "financialBreakdown": {\n    "investmentAmount": "specific amount if applicable",\n    "targetProfit": "expected outcome",\n    "requiredReturn": "percentage or metric",\n    "timePeriod": "expected timeline"\n  }\n}\n\nRULES:\n- Output only the JSON object, no markdown, no explanations, no extra text.\n- All numbers must be numbers, not strings.\n- If not investment-related, omit financialBreakdown.\n- Ensure the JSON is valid and complete.`
      },
      ...messages
    ]

    const result = await streamText({
      model: groq('llama3-8b-8192'),
      messages: enhancedMessages,
      temperature: 0.7,
      maxTokens: 1500,
    })

    // Collect the streamed response as text
    const reader = result.toDataStreamResponse().body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let resultText = '';
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      if (value) {
        resultText += new TextDecoder().decode(value);
      }
      done = doneReading;
    }

    // Parse the JSON and encode as MessagePack
    let jsonData;
    try {
      jsonData = JSON.parse(resultText);
    } catch {
      // Try to extract and join chunked fragments (Groq/Llama3 style)
      const fragmentRegex = /"0":"([^"]*)"/g;
      let match;
      const fragments: string[] = [];
      while ((match = fragmentRegex.exec(resultText)) !== null) {
        fragments.push(match[1]);
      }
      if (fragments.length > 0) {
        let jsonString = fragments.join('');
        jsonString = jsonString.replace(/\\n/g, '').replace(/\\"/g, '"');
        jsonData = JSON.parse(jsonString);
      } else {
        throw new Error('Failed to parse JSON and reconstruct from fragments');
      }
    }
    const msgpackData = encode(jsonData);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an AI decision assistant. Output ONLY a single valid JSON object, nothing else. No markdown, no explanations, no extra text.\n\nSCHEMA:\n{\n  "query": "user's decision question",\n  "analysis": "detailed analysis of the decision context, factors, and implications",\n  "options": [\n    {\n      "name": "specific option name",\n      "pros": ["key advantage 1", "key advantage 2", "key advantage 3"],\n      "cons": ["key disadvantage 1", "key disadvantage 2"],\n      "probability": 85,\n      "riskLevel": "Low/Medium/High"\n    }\n  ],\n  "recommendation": {\n    "bestOption": "recommended option name",\n    "rationale": "detailed explanation of why this option is best, considering all factors",\n    "confidence": 85\n  },\n  "nextSteps": ["specific actionable step 1", "specific actionable step 2", "specific actionable step 3"],\n  "riskAssessment": {\n    "marketRisk": "Low/Medium/High",\n    "volatilityRisk": "Low/Medium/High", \n    "timingRisk": "Low/Medium/High"\n  },\n  "financialBreakdown": {\n    "investmentAmount": "specific amount if applicable",\n    "targetProfit": "expected outcome",\n    "requiredReturn": "percentage or metric",\n    "timePeriod": "expected timeline"\n  }\n}\n\nRULES:\n- Output only the JSON object, no markdown, no explanations, no extra text.\n- All numbers must be numbers, not strings.\n- If not investment-related, omit financialBreakdown.\n- Ensure the JSON is valid and complete.`
          },
          ...messages
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq AI API error:', response.status, errorText);
      return new Response(`Groq AI API error: ${response.status} - ${errorText}`, { status: 500 });
    }

    return new Response(msgpackData, {
      headers: {
        'Content-Type': 'application/msgpack',
        'Content-Length': msgpackData.length.toString()
      }
    });
  } catch (error) {
    console.error('Error in agent API:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 