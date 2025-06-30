# NebulArc 24/7 AI Agent System Setup

## Overview

The NebulArc AI Agent System allows you to create automated AI agents that work 24/7 to perform tasks like:
- Collecting startup news and funding updates
- Monitoring competitors and market trends
- Curating content and articles
- Analyzing social media sentiment
- And much more!

## Features

### 🤖 AI Agents
- **Automated Execution**: Agents run on schedule (hourly, daily, weekly, monthly)
- **Smart Scheduling**: Automatic next-run calculation and execution
- **Template Library**: Pre-built templates for common use cases
- **Real-time Monitoring**: View agent status, runs, and results
- **Manual Control**: Start, pause, and run agents on demand

### 📊 Agent Management
- **Visual Dashboard**: Beautiful RunPod-inspired interface
- **Run History**: Track all agent executions and results
- **Performance Metrics**: Monitor success rates and token usage
- **Error Handling**: Robust error handling and retry logic

## Quick Start

### 1. Database Setup

Run the updated database setup script in your Supabase project:

```sql
-- Execute the contents of database-setup.sql in your Supabase SQL editor
```

This creates the necessary `agents` and `agent_runs` tables with proper RLS policies.

### 2. Environment Variables

Add these to your `.env.local`:

```bash
# For cron job authentication (optional)
CRON_SECRET=your-secret-key-here
```

### 3. Start Using Agents

1. **Navigate to Dashboard**: Go to your dashboard and scroll down to the "AI Agents" section
2. **Choose a Template**: Click "Templates" to see pre-built agent templates
3. **Create Your First Agent**: Select a template or create a custom agent
4. **Configure Schedule**: Set how often the agent should run
5. **Activate**: Your agent will start working automatically!

## Agent Templates

### 🗞️ Startup News Aggregator
- **Schedule**: Daily
- **Task**: Collects and summarizes latest startup news and funding rounds
- **Perfect for**: Entrepreneurs, investors, startup enthusiasts

### 📈 Market Analysis Agent
- **Schedule**: Weekly
- **Task**: Analyzes market trends and provides industry insights
- **Perfect for**: Business analysts, strategists

### 👀 Competitor Monitor
- **Schedule**: Daily
- **Task**: Tracks competitor activities and product updates
- **Perfect for**: Product managers, marketers

### 📚 Content Curator
- **Schedule**: Daily
- **Task**: Curates relevant articles and research papers
- **Perfect for**: Researchers, content creators

### 📱 Social Media Monitor
- **Schedule**: Hourly
- **Task**: Monitors brand mentions and sentiment
- **Perfect for**: Marketing teams, brand managers

## Creating Custom Agents

### Agent Configuration

```typescript
{
  name: "My Custom Agent",
  description: "What this agent does",
  task_prompt: "Detailed instructions for the AI",
  schedule: "daily", // hourly, daily, weekly, monthly, custom
  category: "analysis", // news, analysis, monitoring, content, other
  complexity: "medium", // low, medium, high
  model: "mock-ai-v1" // AI model to use
}
```

### Task Prompt Examples

**News Aggregation**:
```
Research and provide a comprehensive summary of the latest startup news, 
funding rounds, and industry developments from the past 24 hours. 
Include key metrics, notable companies, and emerging trends.
```

**Market Analysis**:
```
Conduct a market analysis for the technology sector, focusing on emerging trends, 
competitive landscape, and growth opportunities. Include data on market size, 
key players, and future projections.
```

**Content Curation**:
```
Curate and summarize the most relevant articles, blog posts, and research papers 
in the AI and machine learning space. Focus on practical insights and actionable content.
```

## Automation Setup

### Option 1: External Cron Service (Recommended)

Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

1. **Set up cron job** to call: `POST https://your-domain.com/api/cron/agents`
2. **Add header**: `Authorization: Bearer your-cron-secret`
3. **Schedule**: Every 5-15 minutes

### Option 2: Vercel Cron (if using Vercel)

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/agents",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Option 3: Manual Execution

Agents can also be run manually from the dashboard using the "Run Now" button.

## Monitoring and Management

### Dashboard Features

- **Agent Status**: See which agents are active/inactive
- **Run History**: View recent executions and results
- **Performance Metrics**: Track success rates and token usage
- **Real-time Updates**: Live status updates during execution

### Agent Controls

- **Start/Pause**: Toggle agent activity
- **Run Now**: Execute agent immediately
- **View Runs**: See detailed execution history
- **Delete**: Remove agents permanently

## Best Practices

### 1. Task Design
- **Be Specific**: Clear, detailed task prompts work better
- **Set Expectations**: Define the format and scope of results
- **Consider Complexity**: Match task complexity to your needs

### 2. Scheduling
- **Start Conservative**: Begin with daily/weekly schedules
- **Monitor Performance**: Adjust frequency based on results
- **Avoid Overlap**: Don't schedule too many agents simultaneously

### 3. Resource Management
- **Token Usage**: Monitor token consumption
- **Error Handling**: Review failed runs and adjust prompts
- **Cleanup**: Archive or delete old agents

## Troubleshooting

### Common Issues

**Agent not running**:
- Check if agent is active
- Verify schedule configuration
- Review cron job setup

**Poor results**:
- Refine task prompt
- Adjust complexity level
- Try different AI models

**High token usage**:
- Simplify task prompts
- Reduce execution frequency
- Use lower complexity settings

### Support

For issues or questions:
1. Check the dashboard logs
2. Review agent run history
3. Test with manual execution
4. Adjust task prompts and settings

## Advanced Features

### Custom Schedules
For advanced scheduling, you can implement cron expressions in the agent service.

### Multiple Models
Agents can use different AI models based on task requirements.

### Integration
The agent system can be extended to integrate with external APIs and services.

---

**Ready to automate your AI tasks?** Create your first agent and let it work for you 24/7! 🚀 