export interface ThoughtNode {
  id: string;
  thought: string;
  confidence: number;
  reasoning: string;
  children?: ThoughtNode[];
  is_solution?: boolean;
}

export interface ChainOfThought {
  steps: string[];
  final_reasoning: string;
  confidence: number;
}

export interface TreeOfThoughts {
  root_thought: string;
  branches: ThoughtNode[];
  best_path: string[];
  final_decision: string;
  confidence: number;
}

export class AIReasoning {
  
  // Chain of Thought (CoT) - Step-by-step reasoning
  async generateChainOfThought(
    problem: string,
    brainType: string,
    context: any
  ): Promise<ChainOfThought> {
    const cotPrompt = `You are an expert ${brainType} analyst using Chain of Thought reasoning.

PROBLEM: ${problem}

CONTEXT: ${JSON.stringify(context)}

Use Chain of Thought reasoning to analyze this problem step by step:

1. First, identify the core issues
2. Consider multiple perspectives
3. Evaluate each option systematically
4. Draw logical conclusions
5. Provide final reasoning

Respond with ONLY valid JSON in this exact format:
{
  "steps": [
    "Step 1: Identify the core problem...",
    "Step 2: Consider the key factors...",
    "Step 3: Evaluate options...",
    "Step 4: Draw conclusions..."
  ],
  "final_reasoning": "Based on the step-by-step analysis...",
  "confidence": 85
}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: 'You are an expert analyst using Chain of Thought reasoning. Always respond with valid JSON only.' },
            { role: 'user', content: cotPrompt },
          ],
          stream: false,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      try {
        return JSON.parse(content);
      } catch (e) {
        // Fallback if JSON parsing fails
        return {
          steps: ["Analysis completed but response format was invalid"],
          final_reasoning: "Chain of Thought analysis completed",
          confidence: 70
        };
      }
    } catch (error) {
      console.error('Chain of Thought generation failed:', error);
      return {
        steps: ["Error in Chain of Thought analysis"],
        final_reasoning: "Analysis failed due to technical error",
        confidence: 50
      };
    }
  }

  // Tree of Thoughts (ToT) - Multi-branch reasoning
  async generateTreeOfThoughts(
    problem: string,
    brainType: string,
    context: any
  ): Promise<TreeOfThoughts> {
    const totPrompt = `You are an expert ${brainType} analyst using Tree of Thoughts reasoning.

PROBLEM: ${problem}

CONTEXT: ${JSON.stringify(context)}

Use Tree of Thoughts reasoning to explore multiple solution paths:

1. Start with a root thought about the problem
2. Generate 3-4 different branches of reasoning
3. For each branch, consider pros and cons
4. Evaluate the best path forward
5. Provide a final decision with confidence

Respond with ONLY valid JSON in this exact format:
{
  "root_thought": "Initial analysis of the problem...",
  "branches": [
    {
      "id": "branch1",
      "thought": "First approach: ...",
      "confidence": 75,
      "reasoning": "This approach considers...",
      "children": [
        {
          "id": "branch1a",
          "thought": "Sub-approach A: ...",
          "confidence": 80,
          "reasoning": "This sub-approach..."
        }
      ]
    }
  ],
  "best_path": ["branch1", "branch1a"],
  "final_decision": "Based on the tree analysis...",
  "confidence": 85
}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: 'You are an expert analyst using Tree of Thoughts reasoning. Always respond with valid JSON only.' },
            { role: 'user', content: totPrompt },
          ],
          stream: false,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      try {
        return JSON.parse(content);
      } catch (e) {
        // Fallback if JSON parsing fails
        return {
          root_thought: "Tree of Thoughts analysis initiated",
          branches: [{
            id: "fallback",
            thought: "Fallback analysis approach",
            confidence: 60,
            reasoning: "Basic analysis due to parsing error"
          }],
          best_path: ["fallback"],
          final_decision: "Analysis completed with fallback reasoning",
          confidence: 60
        };
      }
    } catch (error) {
      console.error('Tree of Thoughts generation failed:', error);
      return {
        root_thought: "Error in Tree of Thoughts analysis",
        branches: [{
          id: "error",
          thought: "Analysis failed due to technical error",
          confidence: 50,
          reasoning: "Technical error prevented proper analysis"
        }],
        best_path: ["error"],
        final_decision: "Analysis failed due to technical error",
        confidence: 50
      };
    }
  }

  // Hybrid reasoning combining CoT and ToT
  async generateHybridReasoning(
    problem: string,
    brainType: string,
    context: any
  ): Promise<{
    chain_of_thought: ChainOfThought;
    tree_of_thoughts: TreeOfThoughts;
    combined_confidence: number;
    final_recommendation: string;
  }> {
    const [cotResult, totResult] = await Promise.all([
      this.generateChainOfThought(problem, brainType, context),
      this.generateTreeOfThoughts(problem, brainType, context)
    ]);

    const combined_confidence = Math.round((cotResult.confidence + totResult.confidence) / 2);
    
    const final_recommendation = `Combined Analysis:
    
Chain of Thought (${cotResult.confidence}% confidence):
${cotResult.final_reasoning}

Tree of Thoughts (${totResult.confidence}% confidence):
${totResult.final_decision}

Combined Confidence: ${combined_confidence}%`;

    return {
      chain_of_thought: cotResult,
      tree_of_thoughts: totResult,
      combined_confidence,
      final_recommendation
    };
  }
}

export const aiReasoning = new AIReasoning(); 