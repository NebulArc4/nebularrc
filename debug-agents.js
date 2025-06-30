// Debug script to check agents and create a test one
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://womqnmytlsqretnfxdmx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvbXFubXl0bHNxcmV0bmZ4ZG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTQ1NDksImV4cCI6MjA2NjY5MDU0OX0.hay9m7IzIDYUztAMalliwlcGx1G1dX4icqCLMbny9Ko'
);

async function debugAgents() {
  try {
    console.log('Checking for existing agents...');
    
    // Check existing agents
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*');
    
    if (error) {
      console.error('Error fetching agents:', error);
      return;
    }
    
    console.log(`Found ${agents?.length || 0} agents in database`);
    
    if (agents && agents.length > 0) {
      console.log('Agents:', agents.map(a => ({ id: a.id, name: a.name, is_active: a.is_active, next_run: a.next_run })));
    }
    
    // Create a test agent if none exist
    if (!agents || agents.length === 0) {
      console.log('Creating test agent...');
      
      const { data: newAgent, error: createError } = await supabase
        .from('agents')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          name: 'Test News Agent',
          description: 'A test agent for startup news',
          task_prompt: 'Provide a brief summary of the latest startup news and trends in the tech industry. Focus on funding rounds, acquisitions, and emerging technologies.',
          schedule: 'daily',
          is_active: true,
          total_runs: 0,
          category: 'news',
          model: 'mock-ai-v1',
          complexity: 'medium',
          next_run: new Date().toISOString() // Set to run immediately
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating agent:', createError);
        return;
      }
      
      console.log('Test agent created:', newAgent.id);
    }
    
    // Check due agents
    console.log('\nChecking due agents...');
    const now = new Date().toISOString();
    const { data: dueAgents, error: dueError } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .lte('next_run', now);
    
    if (dueError) {
      console.error('Error fetching due agents:', dueError);
      return;
    }
    
    console.log(`Found ${dueAgents?.length || 0} due agents`);
    if (dueAgents && dueAgents.length > 0) {
      console.log('Due agents:', dueAgents.map(a => ({ id: a.id, name: a.name, next_run: a.next_run })));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugAgents(); 