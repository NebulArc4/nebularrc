export interface TaskTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  complexity: 'low' | 'medium' | 'high'
  estimatedTokens: number
  suggestedModel: string
  tags: string[]
}

export const taskTemplates: TaskTemplate[] = [
  // Research Templates
  {
    id: 'market-research',
    name: 'Market Research Analysis',
    description: 'Analyze market trends and competitive landscape',
    category: 'research',
    prompt: 'Conduct a comprehensive market research analysis for {topic}. Include market size, key players, trends, opportunities, and threats. Provide actionable insights and recommendations.',
    complexity: 'high',
    estimatedTokens: 800,
    suggestedModel: 'llama3-8b-8192',
    tags: ['research', 'market', 'analysis', 'business']
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Analyze competitors and their strategies',
    category: 'research',
    prompt: 'Perform a detailed competitor analysis for {company/product}. Identify main competitors, their strengths, weaknesses, market positioning, and strategic recommendations.',
    complexity: 'medium',
    estimatedTokens: 600,
    suggestedModel: 'llama3-8b-8192',
    tags: ['research', 'competitors', 'strategy', 'business']
  },

  // Creative Templates
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'Generate engaging content for various platforms',
    category: 'creative',
    prompt: 'Create engaging content about {topic} for {platform}. The content should be informative, engaging, and optimized for the target audience. Include a compelling headline and key points.',
    complexity: 'medium',
    estimatedTokens: 500,
    suggestedModel: 'llama3-8b-8192',
    tags: ['creative', 'content', 'marketing', 'writing']
  },
  {
    id: 'blog-post',
    name: 'Blog Post Outline',
    description: 'Create a structured blog post outline',
    category: 'creative',
    prompt: 'Create a comprehensive blog post outline for "{topic}". Include an attention-grabbing headline, introduction, main sections with subheadings, and a compelling conclusion.',
    complexity: 'low',
    estimatedTokens: 300,
    suggestedModel: 'llama3-8b-8192',
    tags: ['creative', 'blog', 'writing', 'outline']
  },

  // Technical Templates
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review and improve code quality',
    category: 'technical',
    prompt: 'Review the following code for {language}: {code}. Analyze code quality, identify potential issues, suggest improvements, and provide best practices recommendations.',
    complexity: 'high',
    estimatedTokens: 700,
    suggestedModel: 'llama3-8b-8192',
    tags: ['technical', 'code', 'review', 'programming']
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'Design scalable system architecture',
    category: 'technical',
    prompt: 'Design a scalable system architecture for {system_description}. Include system components, data flow, scalability considerations, and technology recommendations.',
    complexity: 'high',
    estimatedTokens: 900,
    suggestedModel: 'llama3-8b-8192',
    tags: ['technical', 'architecture', 'design', 'scalability']
  },

  // Strategy Templates
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    description: 'Develop comprehensive business strategy',
    category: 'strategy',
    prompt: 'Develop a comprehensive business strategy for {business/idea}. Include market analysis, competitive advantage, revenue model, growth strategy, and implementation roadmap.',
    complexity: 'high',
    estimatedTokens: 1000,
    suggestedModel: 'llama3-8b-8192',
    tags: ['strategy', 'business', 'planning', 'growth']
  },
  {
    id: 'marketing-strategy',
    name: 'Marketing Strategy',
    description: 'Create effective marketing strategy',
    category: 'strategy',
    prompt: 'Create a comprehensive marketing strategy for {product/service}. Include target audience, positioning, channels, messaging, and campaign recommendations.',
    complexity: 'medium',
    estimatedTokens: 600,
    suggestedModel: 'llama3-8b-8192',
    tags: ['strategy', 'marketing', 'campaign', 'audience']
  },

  // Analysis Templates
  {
    id: 'data-analysis',
    name: 'Data Analysis Plan',
    description: 'Plan comprehensive data analysis',
    category: 'analysis',
    prompt: 'Create a comprehensive data analysis plan for {dataset/topic}. Include research questions, methodology, key metrics, visualization recommendations, and expected insights.',
    complexity: 'medium',
    estimatedTokens: 500,
    suggestedModel: 'llama3-8b-8192',
    tags: ['analysis', 'data', 'research', 'metrics']
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis',
    description: 'Analyze industry trends and patterns',
    category: 'analysis',
    prompt: 'Analyze current trends in {industry/field}. Identify key drivers, emerging patterns, future predictions, and strategic implications for businesses.',
    complexity: 'medium',
    estimatedTokens: 600,
    suggestedModel: 'llama3-8b-8192',
    tags: ['analysis', 'trends', 'industry', 'prediction']
  },

  // Quick Templates
  {
    id: 'quick-summary',
    name: 'Quick Summary',
    description: 'Create concise summary of any topic',
    category: 'other',
    prompt: 'Provide a concise, well-structured summary of {topic}. Include key points, main takeaways, and actionable insights in a clear, professional format.',
    complexity: 'low',
    estimatedTokens: 200,
    suggestedModel: 'llama3-8b-8192',
    tags: ['summary', 'quick', 'overview']
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Systematic approach to problem solving',
    category: 'other',
    prompt: 'Apply systematic problem-solving approach to {problem}. Break down the problem, identify root causes, explore solutions, and recommend the best approach with implementation steps.',
    complexity: 'medium',
    estimatedTokens: 500,
    suggestedModel: 'llama3-8b-8192',
    tags: ['problem-solving', 'analysis', 'solutions']
  }
]

export function getTemplatesByCategory(category: string): TaskTemplate[] {
  return taskTemplates.filter(template => template.category === category)
}

export function getTemplateById(id: string): TaskTemplate | undefined {
  return taskTemplates.find(template => template.id === id)
}

export function searchTemplates(query: string): TaskTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return taskTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getCategories(): string[] {
  return [...new Set(taskTemplates.map(template => template.category))]
} 