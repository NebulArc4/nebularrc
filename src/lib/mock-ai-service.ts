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
    
    // Extract key topics from the prompt
    const topics = this.extractTopics(prompt)
    
    // Generate a more intelligent response based on the actual prompt content
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('analysis')) {
      return this.generateAnalysisResponse(prompt, topics)
    }
    
    if (lowerPrompt.includes('strategy') || lowerPrompt.includes('plan')) {
      return this.generateStrategyResponse(prompt, topics)
    }
    
    if (lowerPrompt.includes('creative') || lowerPrompt.includes('content') || lowerPrompt.includes('write') || lowerPrompt.includes('generate')) {
      return this.generateCreativeResponse(prompt, topics)
    }
    
    if (lowerPrompt.includes('technical') || lowerPrompt.includes('code') || lowerPrompt.includes('programming') || lowerPrompt.includes('development')) {
      return this.generateTechnicalResponse(prompt, topics)
    }
    
    if (lowerPrompt.includes('research') || lowerPrompt.includes('study') || lowerPrompt.includes('investigate')) {
      return this.generateResearchResponse(prompt, topics)
    }
    
    if (lowerPrompt.includes('review') || lowerPrompt.includes('feedback') || lowerPrompt.includes('evaluate')) {
      return this.generateReviewResponse(prompt, topics)
    }
    
    if (lowerPrompt.includes('customer') || lowerPrompt.includes('user') || lowerPrompt.includes('client')) {
      return this.generateCustomerResponse(prompt, topics)
    }
    
    if (lowerPrompt.includes('market') || lowerPrompt.includes('business') || lowerPrompt.includes('industry')) {
      return this.generateBusinessResponse(prompt, topics)
    }
    
    // For any other custom prompt, generate a contextual response
    return this.generateCustomResponse(prompt, topics)
  }

  private extractTopics(prompt: string): string[] {
    const words = prompt.toLowerCase().split(' ')
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']
    return words.filter(word => word.length > 3 && !stopWords.includes(word)).slice(0, 5)
  }

  private generateAnalysisResponse(prompt: string, topics: string[]): string {
    return `# 📊 Analysis Report

## 🎯 Executive Summary
Based on your request to analyze "${prompt}", I've conducted a comprehensive analysis and identified key insights and actionable recommendations.

## 🔍 Key Findings

### Primary Insights
- **Current State**: Significant opportunities in ${topics.join(' ')} market
- **Trends Identified**: Growing adoption of ${topics.join(' ')} solutions
- **Opportunities**: Market expansion potential in ${topics.join(' ')} sector

### Data Analysis
- **Sample Size**: ${Math.floor(Math.random() * 1000) + 100} data points analyzed
- **Confidence Level**: ${Math.floor(Math.random() * 20) + 80}%
- **Key Metrics**: Performance indicators for ${topics.join(' ')}

## 📈 Recommendations

### Immediate Actions (0-30 days)
1. **Conduct market research for ${topics.join(' ')}**
2. **Analyze competitor strategies in ${topics.join(' ')} space**
3. **Identify key stakeholders for ${topics.join(' ')} initiatives**

### Short-term Strategy (1-3 months)
1. **Develop pilot program for ${topics.join(' ')}**
2. **Implement feedback systems for ${topics.join(' ')}**

### Long-term Vision (3-12 months)
1. **Scale successful ${topics.join(' ')} initiatives**
2. **Expand market presence in ${topics.join(' ')} sector**

## ⚠️ Risk Assessment
- **High Priority**: Market competition in ${topics.join(' ')} space
- **Medium Priority**: Technology adoption challenges
- **Low Priority**: Minor operational inefficiencies

## 📊 Success Metrics
- **Primary KPI**: ${topics.join(' ')} performance improvement
- **Secondary Metrics**: Customer satisfaction, market share
- **Target Timeline**: ${Math.floor(Math.random() * 6) + 3} months

---
*Analysis completed on ${new Date().toLocaleDateString()}*`
  }

  private generateStrategyResponse(prompt: string, topics: string[]): string {
    return `# 🎯 Strategic Plan

## 📋 Strategic Overview
Based on your request: "${prompt}", I've developed a comprehensive strategic framework to achieve your objectives.

## 🏗️ Strategic Framework

### Vision Statement
To become the leading ${topics.join(' ')} solution provider through innovative approaches and sustainable growth.

### Mission
Deliver exceptional ${topics.join(' ')} value while maintaining operational excellence and customer satisfaction.

## 📊 Strategic Pillars

### 1. Innovation & Technology
- **Focus Area**: ${topics.join(' ')} innovation
- **Investment**: $${Math.floor(Math.random() * 500) + 100}K annually
- **Timeline**: 12-18 months

### 2. Market Expansion
- **Target Markets**: ${topics.join(' ')} market segments
- **Growth Rate**: ${Math.floor(Math.random() * 30) + 20}% YoY
- **Entry Strategy**: Phased approach to ${topics.join(' ')}

### 3. Operational Excellence
- **Efficiency Goals**: ${Math.floor(Math.random() * 30) + 20}% improvement
- **Cost Reduction**: ${Math.floor(Math.random() * 25) + 15}%
- **Quality Metrics**: ${Math.floor(Math.random() * 10) + 90}% satisfaction

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- **Establish ${topics.join(' ')} infrastructure**
- **Build core ${topics.join(' ')} capabilities**
- **Conduct ${topics.join(' ')} market research**

### Phase 2: Growth (Months 4-9)
- **Develop ${topics.join(' ')} MVP**
- **Launch ${topics.join(' ')} pilot programs**
- **Scale ${topics.join(' ')} initiatives**

### Phase 3: Scale (Months 10-18)
- **Expand ${topics.join(' ')} market presence**
- **Optimize ${topics.join(' ')} operations**
- **Achieve ${topics.join(' ')} market leadership**

## 💰 Resource Allocation
- **Technology**: ${Math.floor(Math.random() * 30) + 40}%
- **Marketing**: ${Math.floor(Math.random() * 20) + 25}%
- **Operations**: ${Math.floor(Math.random() * 20) + 20}%
- **R&D**: ${Math.floor(Math.random() * 15) + 15}%

## 📈 Success Metrics
- **Revenue Growth**: ${Math.floor(Math.random() * 50) + 50}% YoY
- **Market Share**: ${Math.floor(Math.random() * 10) + 5}% target
- **Customer Satisfaction**: ${Math.floor(Math.random() * 10) + 90}%
- **Employee Retention**: ${Math.floor(Math.random() * 10) + 85}%

---
*Strategic plan developed on ${new Date().toLocaleDateString()}*`
  }

  private generateCreativeResponse(prompt: string, topics: string[]): string {
    return `# 🎨 Creative Solution

## 💡 Creative Concept
Based on your request: "${prompt}", I've developed an innovative creative approach that addresses your specific needs.

## 🎭 Creative Direction

### Concept: "Innovative ${topics.join(' ')} Solution"
A modern and user-centric approach that combines ${topics.join(' ')} with cutting-edge design to create exceptional user experiences.

### Visual Identity
- **Color Palette**: Modern blue and green palette
- **Typography**: Clean, professional sans-serif
- **Imagery Style**: Contemporary and minimalist

## 🎯 Creative Elements

### 1. Brand Story
"Empowering ${topics.join(' ')} through innovation and creativity"

### 2. Key Messages
- **Primary**: Revolutionary ${topics.join(' ')} approach
- **Secondary**: User-focused ${topics.join(' ')} design
- **Tertiary**: Innovative ${topics.join(' ')} solutions

### 3. Creative Assets
- **Logo Design**: Modern ${topics.join(' ')} branding
- **Website Design**: Responsive ${topics.join(' ')} interface
- **Marketing Materials**: Engaging ${topics.join(' ')} content
- **Social Media**: Dynamic ${topics.join(' ')} presence

## 🚀 Implementation Strategy

### Creative Development
1. **Research ${topics.join(' ')} market trends**
2. **Develop ${topics.join(' ')} concepts**
3. **Design ${topics.join(' ')} solutions**
4. **Produce ${topics.join(' ')} assets**

### Timeline
- **Research Phase**: 2 weeks
- **Concept Development**: 3 weeks
- **Design Execution**: 4 weeks
- **Production**: 2 weeks

## 📊 Creative Metrics
- **Brand Recognition**: ${Math.floor(Math.random() * 30) + 40}% target
- **Engagement Rate**: ${Math.floor(Math.random() * 15) + 25}%
- **Conversion Rate**: ${Math.floor(Math.random() * 10) + 15}%
- **Customer Feedback**: ${Math.floor(Math.random() * 10) + 85}% positive

## 🎨 Design Principles
- **Simplicity**: Clean, uncluttered design
- **Authenticity**: Genuine representation of values
- **Innovation**: Cutting-edge creative approaches
- **Accessibility**: Inclusive design for all users

---
*Creative concept developed on ${new Date().toLocaleDateString()}*`
  }

  private generateTechnicalResponse(prompt: string, topics: string[]): string {
    return `# 💻 Technical Analysis

## 🔧 Technical Overview
Based on your request: "${prompt}", I've analyzed the technical requirements and provided comprehensive recommendations.

## 🏗️ Architecture Recommendations

### System Architecture
- **Pattern**: Microservices-based architecture
- **Scalability**: Horizontal scaling capability
- **Security**: Multi-layer security framework

### Technology Stack
- **Frontend**: React/Next.js for performance
- **Backend**: Node.js/Python for flexibility
- **Database**: PostgreSQL for reliability
- **Infrastructure**: Docker/Kubernetes for scalability

## 📊 Technical Specifications

### Performance Requirements
- **Response Time**: < ${Math.floor(Math.random() * 200) + 100}ms
- **Throughput**: ${Math.floor(Math.random() * 1000) + 500} requests/second
- **Uptime**: ${Math.floor(Math.random() * 5) + 99}% SLA
- **Scalability**: ${Math.floor(Math.random() * 10) + 10}x current capacity

### Security Framework
- **Authentication**: OAuth 2.0 implementation
- **Authorization**: Role-based access control
- **Data Protection**: End-to-end encryption
- **Compliance**: GDPR and industry standards

## 🚀 Implementation Plan

### Phase 1: Foundation (4-6 weeks)
- **Set up ${topics.join(' ')} development environment**
- **Establish ${topics.join(' ')} architecture**
- **Configure ${topics.join(' ')} infrastructure**

### Phase 2: Development (8-12 weeks)
- **Develop ${topics.join(' ')} core features**
- **Implement ${topics.join(' ')} integrations**
- **Build ${topics.join(' ')} user interface**

### Phase 3: Testing & Deployment (4-6 weeks)
- **Test ${topics.join(' ')} functionality**
- **Deploy ${topics.join(' ')} to production**

## 📈 Technical Metrics
- **Code Quality**: ${Math.floor(Math.random() * 10) + 90}% test coverage
- **Performance**: ${Math.floor(Math.random() * 20) + 80}% improvement
- **Security**: ${Math.floor(Math.random() * 10) + 90}% security score
- **Maintainability**: ${Math.floor(Math.random() * 10) + 85}% score

## 🔍 Best Practices
- **Code Standards**: Industry best practices
- **Testing Strategy**: Comprehensive test coverage
- **Documentation**: Detailed technical documentation
- **Monitoring**: Real-time performance monitoring

---
*Technical analysis completed on ${new Date().toLocaleDateString()}*`
  }

  private generateResearchResponse(prompt: string, topics: string[]): string {
    return `# 🔬 Research Report

## 📚 Research Overview
Based on your request: "${prompt}", I've conducted comprehensive research and analysis.

## 🎯 Research Objectives
- Understand ${topics.join(' ')} market dynamics
- Identify ${topics.join(' ')} opportunities
- Analyze ${topics.join(' ')} challenges

## 📊 Research Methodology
- **Primary Research**: ${Math.floor(Math.random() * 100) + 50} interviews
- **Secondary Research**: ${Math.floor(Math.random() * 50) + 25} sources
- **Data Analysis**: Statistical analysis of ${topics.join(' ')} trends

## 🔍 Key Findings
1. **${topics.join(' ')} market growth**: ${Math.floor(Math.random() * 30) + 20}% annually
2. **Customer demand**: High interest in ${topics.join(' ')} solutions
3. **Competitive landscape**: Emerging opportunities in ${topics.join(' ')}

## 📈 Recommendations
- **Short-term**: Focus on ${topics.join(' ')} development
- **Medium-term**: Expand ${topics.join(' ')} market presence
- **Long-term**: Establish ${topics.join(' ')} leadership position

---
*Research completed on ${new Date().toLocaleDateString()}*`
  }

  private generateReviewResponse(prompt: string, topics: string[]): string {
    return `# 📝 Review Report

## 🔍 Review Summary
Based on your request: "${prompt}", I've conducted a thorough review and evaluation.

## 📊 Review Criteria
- **Quality**: ${topics.join(' ')} standards assessment
- **Performance**: ${topics.join(' ')} effectiveness evaluation
- **User Experience**: ${topics.join(' ')} usability review

## 🎯 Key Findings
- **Strengths**: Strong ${topics.join(' ')} foundation
- **Areas for Improvement**: ${topics.join(' ')} optimization opportunities
- **Recommendations**: ${topics.join(' ')} enhancement strategies

## 📈 Action Items
1. **Implement ${topics.join(' ')} improvements**
2. **Optimize ${topics.join(' ')} processes**
3. **Enhance ${topics.join(' ')} user experience**

---
*Review completed on ${new Date().toLocaleDateString()}*`
  }

  private generateCustomerResponse(prompt: string, topics: string[]): string {
    return `# 👥 Customer Analysis

## 🎯 Customer Focus
Based on your request: "${prompt}", I've analyzed customer needs and preferences.

## 📊 Customer Insights
- **Target Audience**: ${topics.join(' ')} users
- **Pain Points**: ${topics.join(' ')} challenges
- **Preferences**: ${topics.join(' ')} requirements

## 💡 Customer Solutions
- **Immediate**: Address ${topics.join(' ')} concerns
- **Short-term**: Improve ${topics.join(' ')} experience
- **Long-term**: Enhance ${topics.join(' ')} satisfaction

## 📈 Customer Metrics
- **Satisfaction**: ${Math.floor(Math.random() * 20) + 80}%
- **Retention**: ${Math.floor(Math.random() * 15) + 85}%
- **Engagement**: ${Math.floor(Math.random() * 25) + 75}%

---
*Customer analysis completed on ${new Date().toLocaleDateString()}*`
  }

  private generateBusinessResponse(prompt: string, topics: string[]): string {
    return `# 💼 Business Analysis

## 🏢 Business Overview
Based on your request: "${prompt}", I've analyzed business opportunities and strategies.

## 📊 Market Analysis
- **Market Size**: $${Math.floor(Math.random() * 100) + 50}B industry
- **Growth Rate**: ${Math.floor(Math.random() * 30) + 15}% annually
- **Competition**: ${Math.floor(Math.random() * 20) + 10} major players

## 🎯 Business Strategy
- **Market Entry**: Strategic ${topics.join(' ')} approach
- **Competitive Advantage**: Unique ${topics.join(' ')} positioning
- **Revenue Model**: Sustainable ${topics.join(' ')} monetization

## 📈 Business Metrics
- **Revenue Potential**: $${Math.floor(Math.random() * 10) + 5}M annually
- **Market Share**: ${Math.floor(Math.random() * 10) + 5}% target
- **ROI**: ${Math.floor(Math.random() * 50) + 100}% expected return

---
*Business analysis completed on ${new Date().toLocaleDateString()}*`
  }

  private generateCustomResponse(prompt: string, topics: string[]): string {
    return `# 🎯 Custom Response

## 📋 Request Analysis
Based on your specific request: "${prompt}", I've prepared a comprehensive response tailored to your needs.

## 🔍 Understanding Your Request
Your request focuses on ${topics.join(', ')} and requires comprehensive analysis and strategic planning.

## 💡 Key Insights

### Primary Considerations
- **Market Opportunity**: Significant potential in ${topics.join(' ')} space
- **Technical Requirements**: Robust ${topics.join(' ')} infrastructure needed
- **Strategic Approach**: Phased implementation for ${topics.join(' ')}

### Contextual Analysis
The current landscape for ${topics.join(' ')} shows accelerating adoption with emerging opportunities for innovation and growth.

## 🎯 Recommendations

### Immediate Actions
1. **Conduct ${topics.join(' ')} market research**
2. **Develop ${topics.join(' ')} strategy framework**

### Strategic Approach
1. **Implement ${topics.join(' ')} pilot program**
2. **Scale successful ${topics.join(' ')} initiatives**

### Long-term Vision
1. **Establish ${topics.join(' ')} market leadership**
2. **Achieve sustainable ${topics.join(' ')} growth**

## 📊 Expected Outcomes
- **Short-term**: Improved ${topics.join(' ')} understanding
- **Medium-term**: Enhanced ${topics.join(' ')} capabilities
- **Long-term**: Market leadership in ${topics.join(' ')}

## ⚠️ Considerations
- **Challenges**: Market competition and technology adoption
- **Risks**: Resource constraints and timeline delays
- **Opportunities**: Market expansion and innovation potential

## 📈 Success Metrics
- **Primary Goal**: ${topics.join(' ')} performance improvement
- **Secondary Goals**: Market share growth, customer satisfaction
- **Timeline**: ${Math.floor(Math.random() * 12) + 6} months

---
*Response generated on ${new Date().toLocaleDateString()}*`
  }
}

export const mockAIService = MockAIService.getInstance() 