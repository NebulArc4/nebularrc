// Test script to create and run an agent
const { agentService } = require('./src/lib/agent-service');

async function testAgent() {
  try {
    console.log('Creating test agent...');
    
    // Create a test agent
    const agent = await agentService.createAgent({
      user_id: 'test-user-123',
      name: 'Test News Agent',
      description: 'A test agent that provides startup news summaries',
      task_prompt: 'Provide a brief summary of the latest startup news and trends in the tech industry. Focus on funding rounds, acquisitions, and emerging technologies. Include 3-5 key highlights.',
      schedule: 'daily',
      category: 'news',
      model: 'mock-ai-v1',
      complexity: 'medium'
    });
    
    console.log('Agent created:', agent.id);
    
    // Run the agent immediately
    console.log('Running agent...');
    const run = await agentService.runAgent(agent.id, agent.user_id);
    
    console.log('Agent run completed:', {
      runId: run.id,
      status: run.status,
      result: run.result?.substring(0, 200) + '...'
    });
    
  } catch (error) {
    console.error('Error testing agent:', error);
  }
}

testAgent(); 