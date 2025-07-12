import { tools } from './tools'

export interface ToolCallResult {
  tool: string
  input: unknown
  output: string
}

export interface AnalysisResult {
  query: string
  analysis: string
  options: Array<{
    name: string
    pros: string[]
    cons: string[]
    probability: number
    riskLevel: 'Low' | 'Medium' | 'High'
  }>
  recommendation: {
    bestOption: string
    rationale: string
    confidence: number
  }
  nextSteps: string[]
  riskAssessment: {
    marketRisk: 'Low' | 'Medium' | 'High'
    volatilityRisk: 'Low' | 'Medium' | 'High'
    timingRisk: 'Low' | 'Medium' | 'High'
  }
  financialBreakdown?: {
    investmentAmount?: string
    targetProfit?: string
    requiredReturn?: string
    timePeriod?: string
  }
  toolCallResults?: ToolCallResult[]
  _raw?: string
  _fallback?: boolean
  debugInfo?: string
}

export async function fetchAIAnalysis(query: string, module?: string, setDebugInfo?: (info: string) => void, onStream?: (partial: string) => void): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/arcbrain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        expert: module || 'strategy'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    let debugInfo = `Response content-type: ${contentType}\nResponse status: ${response.status}\n`;

    // Handle streaming response
    if (contentType && contentType.includes('text/event-stream')) {
      const reader = response.body!.getReader();
      let resultText = '';
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = new TextDecoder().decode(value);
          resultText += chunk;
          if (onStream) onStream(resultText);
        }
      }
      debugInfo += `Received streamed response (${resultText.length} chars)\n`;
      debugInfo += `Response preview: ${resultText.slice(0, 200)}...\n`;
      try {
        const jsonData = JSON.parse(resultText);
        debugInfo += 'Successfully parsed JSON response.\n';
        if (setDebugInfo) setDebugInfo(debugInfo);
        return {
          ...jsonData,
          _raw: resultText,
          debugInfo,
          _fallback: false
        };
      } catch (error) {
        debugInfo += `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}\n`;
        if (setDebugInfo) setDebugInfo(debugInfo);
        return createFallbackResult(query, debugInfo);
      }
    }

    // Fallback: handle regular JSON response
    const resultText = await response.text();
    debugInfo += `Received response (${resultText.length} chars)\n`;
    debugInfo += `Response preview: ${resultText.slice(0, 200)}...\n`;
    try {
      const jsonData = JSON.parse(resultText);
      debugInfo += 'Successfully parsed JSON response.\n';
      if (setDebugInfo) setDebugInfo(debugInfo);
      return {
        ...jsonData,
        _raw: resultText,
        debugInfo,
        _fallback: false
      };
    } catch (error) {
      debugInfo += `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}\n`;
      if (setDebugInfo) setDebugInfo(debugInfo);
      return createFallbackResult(query, debugInfo);
    }
  } catch (error) {
    const debugInfo = `Request failed: ${error instanceof Error ? error.message : String(error)}\n`;
    if (setDebugInfo) setDebugInfo(debugInfo);
    return createFallbackResult(query, debugInfo);
  }
}

async function processToolCalls(result: AnalysisResult, debugInfo: string, setDebugInfo?: (info: string) => void) {
  const toolResults: ToolCallResult[] = [];

  for (const call of result.toolCallResults || []) {
    const fn = (tools as Record<string, (input: unknown) => Promise<string>>)[call.tool];
    if (fn) {
      try {
        debugInfo += `Executing tool: ${call.tool}\n`;
        const output = await fn(call.input);
        toolResults.push({ tool: call.tool, input: call.input, output });
        debugInfo += `Tool ${call.tool} executed successfully.\n`;
      } catch (err) {
        debugInfo += `Tool ${call.tool} failed: ${err instanceof Error ? err.message : String(err)}\n`;
        toolResults.push({ tool: call.tool, input: call.input, output: 'Error: ' + (err instanceof Error ? err.message : String(err)) });
      }
    } else {
      debugInfo += `Tool ${call.tool} not found in tools registry.\n`;
      toolResults.push({ tool: call.tool, input: call.input, output: 'Error: Tool not found' });
    }
  }

  result.toolCallResults = toolResults;
  if (setDebugInfo) setDebugInfo(debugInfo);
}

function createFallbackResult(query: string, debugInfo: string): AnalysisResult {
  return {
    query,
    analysis: `Based on your query "${query}", the AI response could not be parsed. This is a fallback analysis.`,
    options: [
      {
        name: "Conservative Approach",
        pros: ["Lower risk", "More predictable outcomes", "Easier to manage"],
        cons: ["Limited upside potential", "May miss opportunities"],
        probability: 75,
        riskLevel: "Low"
      },
      {
        name: "Balanced Strategy",
        pros: ["Good risk-reward balance", "Moderate growth potential"],
        cons: ["Requires active management", "Market dependent"],
        probability: 65,
        riskLevel: "Medium"
      }
    ],
    recommendation: {
      bestOption: "Conservative Approach",
      rationale: "This fallback is provided because the AI response could not be parsed. Please check the debug output for details.",
      confidence: 50
    },
    nextSteps: [],
    riskAssessment: {
      marketRisk: "Medium",
      volatilityRisk: "Medium",
      timingRisk: "Medium"
    },
    financialBreakdown: {
      investmentAmount: "",
      targetProfit: "",
      requiredReturn: "",
      timePeriod: ""
    },
    _raw: "Fallback response",
    debugInfo,
    _fallback: true
  };
}

 