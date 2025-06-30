export interface AITaskRequest {
  taskId: string
  prompt: string
  userId: string
  model?: string
}

export interface AITaskResponse {
  taskId: string
  result: string
  status: 'completed' | 'failed'
  error?: string
  model: string
  tokensUsed?: number
}

export class MockAIService {
  private static instance: MockAIService

  private constructor() {}

  public static getInstance(): MockAIService {
    if (!MockAIService.instance) {
      MockAIService.instance = new MockAIService()
    }
    return MockAIService.instance
  }

  async processTask(request: AITaskRequest): Promise<AITaskResponse> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      console.log(`Processing task ${request.taskId} with mock AI`)
      
      // Generate a contextual response based on the prompt
      const response = this.generateMockResponse(request.prompt)
      
      return {
        taskId: request.taskId,
        result: response,
        status: 'completed',
        model: 'mock-ai-v1',
        tokensUsed: response.length
      }

    } catch (error) {
      console.error(`Error processing task ${request.taskId}:`, error)
      
      return {
        taskId: request.taskId,
        result: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        model: 'mock-ai-v1'
      }
    }
  }

  private generateMockResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()
    
    // Generate contextual responses based on keywords
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('analysis')) {
      return `Based on my analysis of your request, here are the key insights:

1. **Market Trends**: The current landscape shows significant growth in AI adoption across industries
2. **Key Factors**: Technology advancement, cost reduction, and increased accessibility are driving adoption
3. **Recommendations**: Focus on practical applications and ROI-driven implementations
4. **Risk Assessment**: Consider data privacy, ethical implications, and regulatory compliance

This analysis suggests a positive outlook with careful consideration of implementation strategies.`
    }
    
    if (lowerPrompt.includes('strategy') || lowerPrompt.includes('plan')) {
      return `Here's a comprehensive strategy for your request:

**Phase 1: Foundation (Months 1-3)**
- Establish clear objectives and success metrics
- Build core infrastructure and team capabilities
- Conduct market research and competitive analysis

**Phase 2: Implementation (Months 4-9)**
- Develop MVP and pilot programs
- Gather feedback and iterate
- Scale successful initiatives

**Phase 3: Optimization (Months 10-12)**
- Refine processes and systems
- Expand to new markets/segments
- Measure and report on ROI

This strategic approach ensures sustainable growth and measurable outcomes.`
    }
    
    if (lowerPrompt.includes('creative') || lowerPrompt.includes('content')) {
      return `Creative solution for your request:

**Concept: "Innovation Through Collaboration"**

**Key Elements:**
- Cross-functional team approach
- Design thinking methodology
- Rapid prototyping cycles
- User-centered design principles

**Implementation Ideas:**
1. Interactive workshops and brainstorming sessions
2. Digital collaboration tools and platforms
3. Regular innovation challenges and hackathons
4. Feedback loops and continuous improvement

This creative approach fosters innovation while maintaining practical business value.`
    }
    
    if (lowerPrompt.includes('technical') || lowerPrompt.includes('code')) {
      return `Technical analysis and recommendations:

**Architecture Overview:**
- Microservices-based architecture for scalability
- API-first design for integration flexibility
- Cloud-native deployment for reliability
- Security-first approach with encryption and authentication

**Technology Stack:**
- Frontend: React/Next.js for performance
- Backend: Node.js/Python for flexibility
- Database: PostgreSQL for reliability
- Infrastructure: Docker/Kubernetes for scalability

**Best Practices:**
- Code review and testing protocols
- CI/CD pipeline automation
- Monitoring and logging systems
- Documentation and knowledge sharing

This technical foundation ensures robust, scalable, and maintainable solutions.`
    }
    
    // Default response
    return `Thank you for your request. Here's my comprehensive response:

**Executive Summary:**
Your inquiry has been thoroughly analyzed and I've prepared actionable insights and recommendations.

**Key Findings:**
- Current market conditions are favorable for implementation
- Several opportunities exist for optimization and growth
- Risk factors have been identified and mitigation strategies developed

**Next Steps:**
1. Review the detailed analysis provided
2. Prioritize recommendations based on your specific needs
3. Develop an implementation timeline
4. Establish success metrics and monitoring systems

**Additional Considerations:**
- Resource allocation and budget planning
- Stakeholder communication and buy-in
- Training and change management requirements
- Long-term sustainability and scalability

This response provides a solid foundation for moving forward with your initiative.`
  }

  async analyzeTask(prompt: string): Promise<{
    category: string
    complexity: 'low' | 'medium' | 'high'
    estimatedTokens: number
    suggestedModel: string
  }> {
    // Simple rule-based analysis
    const words = prompt.toLowerCase().split(' ')
    
    // Category detection
    let category = 'other'
    if (words.some(w => ['analyze', 'analysis', 'data', 'trends', 'research'].includes(w))) {
      category = 'analysis'
    } else if (words.some(w => ['create', 'generate', 'write', 'content', 'creative'].includes(w))) {
      category = 'creative'
    } else if (words.some(w => ['strategy', 'plan', 'business', 'marketing'].includes(w))) {
      category = 'strategy'
    } else if (words.some(w => ['code', 'technical', 'programming', 'development'].includes(w))) {
      category = 'technical'
    } else if (words.some(w => ['research', 'study', 'investigate'].includes(w))) {
      category = 'research'
    }

    // Complexity detection
    let complexity: 'low' | 'medium' | 'high' = 'medium'
    const wordCount = words.length
    if (wordCount < 10) {
      complexity = 'low'
    } else if (wordCount > 30) {
      complexity = 'high'
    }

    // Token estimation
    const estimatedTokens = Math.ceil(wordCount * 1.3)

    return {
      category,
      complexity,
      estimatedTokens,
      suggestedModel: 'mock-ai-v1'
    }
  }
}

export const mockAIService = MockAIService.getInstance() 