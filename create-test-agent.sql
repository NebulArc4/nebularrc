-- Create a test agent for demonstration
INSERT INTO agents (
  id,
  user_id,
  name,
  description,
  task_prompt,
  schedule,
  is_active,
  total_runs,
  created_at,
  updated_at,
  category,
  model,
  complexity,
  next_run
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000', -- Placeholder user ID
  'Test News Agent',
  'A test agent that provides startup news summaries',
  'Provide a brief summary of the latest startup news and trends in the tech industry. Focus on funding rounds, acquisitions, and emerging technologies. Include 3-5 key highlights.',
  'daily',
  true,
  0,
  NOW(),
  NOW(),
  'news',
  'mock-ai-v1',
  'medium',
  NOW() -- Set to run immediately
); 