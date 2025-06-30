# NebulArc AI Setup Guide

## 🚀 Core AI Functionality Setup (Works Out of the Box!)

### 1. **Quick Start (No Setup Required!)**

**Great news!** NebulArc works immediately with mock AI - no API keys needed!

1. Start your development server: `npm run dev`
2. Navigate to `/dashboard`
3. Submit tasks and see AI responses instantly!

The mock AI provides realistic, contextual responses for testing and development.

### 2. **Environment Variables (Optional)**

For production use with real AI, create a `.env.local` file:

```bash
# Supabase Configuration (Required for database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Hugging Face Configuration (Optional - FREE!)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Database URL (if using direct connection)
DATABASE_URL=your_database_url
```

**Note**: If you don't set `HUGGINGFACE_API_KEY`, the system automatically uses mock AI.

### 3. **Database Schema Updates**

Your `tasks` table should have the following columns:

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_prompt TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  result TEXT,
  error_message TEXT,
  category TEXT,
  complexity TEXT CHECK (complexity IN ('low', 'medium', 'high')),
  estimated_tokens INTEGER,
  suggested_model TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. **API Keys Setup (Optional)**

#### Option A: Mock AI (Default - No Setup Required)
- ✅ **Works immediately** - No API keys needed
- ✅ **Realistic responses** - Contextual AI-like responses
- ✅ **Perfect for testing** - Simulates real AI behavior
- ✅ **No limits** - Unlimited usage

#### Option B: Hugging Face API Key (FREE!)
1. Go to [Hugging Face](https://huggingface.co/)
2. Create a free account or sign in
3. Navigate to Settings > Access Tokens
4. Create a new token (it's free!)
5. Add it to your `.env.local` file

**No payment details required!** Hugging Face offers generous free limits.

#### Supabase Setup (Required for database)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Get your service role key from Settings > API (keep this secret!)
4. Add them to your `.env.local` file

### 5. **Features Implemented**

✅ **AI Task Processing**: Tasks are automatically processed (mock AI or Hugging Face)
✅ **Task Analysis**: Intelligent task complexity and category detection
✅ **Real-time Updates**: Task list updates automatically every 5 seconds
✅ **Error Handling**: Comprehensive error handling and user feedback
✅ **Status Tracking**: Full task lifecycle tracking (pending → in_progress → completed/failed)
✅ **Model Selection**: Automatic model selection based on task complexity
✅ **Token Tracking**: Track token usage for monitoring
✅ **Zero Setup**: Works immediately with mock AI
✅ **FREE**: No payment required

### 6. **Usage**

1. **Submit a Task**: Use the task submission form on the dashboard
2. **Monitor Progress**: Watch tasks update in real-time
3. **View Results**: Completed tasks show AI-generated results
4. **Track Usage**: See model used and tokens consumed

### 7. **Supported Task Types**

- **Research**: Market analysis, competitive research
- **Analysis**: Data analysis, trend identification
- **Creative**: Content generation, brainstorming
- **Technical**: Code review, technical planning
- **Strategy**: Business strategy, planning
- **Other**: General tasks

### 8. **AI Services**

#### Mock AI (Default)
- **Model**: mock-ai-v1
- **Response Time**: 2-5 seconds (simulated)
- **Quality**: High-quality contextual responses
- **Setup**: None required

#### Hugging Face (Optional)
- **Models**: microsoft/DialoGPT-medium, microsoft/DialoGPT-large, gpt2
- **Response Time**: 1-3 seconds
- **Quality**: Real AI responses
- **Setup**: Free API key required

### 9. **Free Tier Limits**

- **Mock AI**: Unlimited (no limits!)
- **Hugging Face**: 30,000 requests per month (very generous!)
- **Supabase**: 500MB database, 50,000 monthly active users
- **No credit card required!**

### 10. **Next Steps**

After setup, you can:
- Add more free AI providers (Ollama for local models)
- Implement task templates
- Add team collaboration features
- Create custom workflows
- Add usage analytics

## 🎯 Testing

### Quick Test (No Setup Required)
1. Start your development server: `npm run dev`
2. Navigate to `/dashboard`
3. Submit a test task like: "Analyze the current trends in AI technology"
4. Watch the task process in real-time
5. View the AI-generated result

### Test with Real AI (Optional)
1. Get a free Hugging Face API key
2. Add it to your `.env.local` file
3. Restart your development server
4. Submit tasks and see real AI responses

## 🔧 Troubleshooting

- **Mock AI Issues**: Should work immediately, check console for errors
- **Hugging Face Issues**: Ensure your API key is valid
- **Database Errors**: Check your Supabase connection and RLS policies
- **Task Processing Fails**: Check the server logs for detailed error messages
- **Rate Limits**: Hugging Face has generous limits, but check if you've hit them

## 💡 Why This Approach?

- ✅ **Zero Setup** - Works immediately with mock AI
- ✅ **No Payment Required** - Completely free to start
- ✅ **Easy Upgrade** - Add real AI when ready
- ✅ **Perfect for Development** - Test everything without API costs
- ✅ **Production Ready** - Switch to real AI for production use 