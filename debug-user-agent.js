// Debug script to check what agents exist (using service role key)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://womqnmytlsqretnfxdmx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvbXFubXl0bHNxcmV0bmZ4ZG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTExNDU0OSwiZXhwIjoyMDY2NjkwNTQ5fQ.Q8XsN3bQ21UJ8Rk03a4Kai7vt7s7k7uc5OID-lw0gCU' // <-- Replace with your actual service role key
);

async function debugUserAgent() {
  try {
    console.log('🔍 Debugging Agent Issues...\n');
    
    // 1. Check what agents exist
    console.log('1. Checking all agents in database...');
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (agentsError) {
      console.error('❌ Error fetching agents:', agentsError);
      return;
    }
    
    console.log(`✅ Found ${agents.length} agents in database:`);
    if (agents.length === 0) {
      console.log('   No agents found! You need to create an agent first.\n');
    } else {
      agents.forEach((agent, index) => {
        console.log(`   Agent ${index + 1}:`);
        console.log(`     ID: ${agent.id}`);
        console.log(`     Name: ${agent.name}`);
        console.log(`     User ID: ${agent.user_id}`);
        console.log(`     Active: ${agent.is_active}`);
        console.log(`     Total Runs: ${agent.total_runs}`);
        console.log(`     Created: ${agent.created_at}`);
        console.log('');
      });
    }
    
    // 2. Check all agent runs
    console.log('2. Checking all agent runs...');
    const { data: runs, error: runsError } = await supabase
      .from('agent_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);
    
    if (runsError) {
      console.error('❌ Error fetching runs:', runsError);
      return;
    }
    
    console.log(`✅ Found ${runs.length} agent runs in database:`);
    if (runs.length === 0) {
      console.log('   No runs found! No agents have been executed yet.\n');
    } else {
      runs.forEach((run, index) => {
        console.log(`   Run ${index + 1}:`);
        console.log(`     ID: ${run.id}`);
        console.log(`     Agent ID: ${run.agent_id}`);
        console.log(`     User ID: ${run.user_id}`);
        console.log(`     Status: ${run.status}`);
        console.log(`     Started: ${run.started_at}`);
        console.log(`     Result: ${run.result ? 'Yes' : 'No'}`);
        console.log(`     Error: ${run.error_message || 'None'}`);
        console.log('');
      });
    }
    
    // 3. Summary
    console.log('📋 SUMMARY:');
    if (agents.length === 0) {
      console.log('❌ PROBLEM: No agents exist in the database.');
      console.log('   SOLUTION: You need to create an agent first.');
      console.log('   ACTION: Go to your dashboard and create an agent.');
    } else {
      console.log('✅ Agents exist in the database.');
      console.log('❌ PROBLEM: The agent ID you provided does not exist.');
      console.log('   SOLUTION: Use one of the agent IDs from above.');
      console.log('   ACTION: Check your dashboard for the correct agent ID.');
    }
    
    if (runs.length === 0) {
      console.log('❌ PROBLEM: No agent runs exist.');
      console.log('   SOLUTION: Run an agent to create execution history.');
      console.log('   ACTION: Click "Run Now" on an agent in the dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

debugUserAgent(); 