-- Create decision_logs table for ArcBrain decision history
CREATE TABLE IF NOT EXISTS decision_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  query TEXT NOT NULL,
  expert_module TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  recommendation TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add indexes for better query performance
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_decision_logs_user_id ON decision_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_logs_created_at ON decision_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_logs_expert_module ON decision_logs(expert_module);

-- Enable Row Level Security (RLS)
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own decision logs
CREATE POLICY "Users can view their own decision logs" ON decision_logs
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own decision logs
CREATE POLICY "Users can insert their own decision logs" ON decision_logs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy to allow users to update their own decision logs
CREATE POLICY "Users can update their own decision logs" ON decision_logs
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policy to allow users to delete their own decision logs
CREATE POLICY "Users can delete their own decision logs" ON decision_logs
  FOR DELETE USING (auth.uid()::text = user_id);

-- Add comments for documentation
COMMENT ON TABLE decision_logs IS 'Stores decision analysis history from ArcBrain system';
COMMENT ON COLUMN decision_logs.user_id IS 'User ID from auth.users table';
COMMENT ON COLUMN decision_logs.query IS 'The original decision query from the user';
COMMENT ON COLUMN decision_logs.expert_module IS 'The expert brain module used (general, strategy, finance, health)';
COMMENT ON COLUMN decision_logs.analysis_data IS 'Complete analysis data as JSON';
COMMENT ON COLUMN decision_logs.recommendation IS 'The final recommendation from the analysis';
COMMENT ON COLUMN decision_logs.confidence_score IS 'Confidence score (0-100) for the recommendation';
COMMENT ON COLUMN decision_logs.created_at IS 'Timestamp when the decision was analyzed'; 