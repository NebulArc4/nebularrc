# 🚀 Real AI Integration Setup Guide

Transform NebulArc from mock AI to real AI with live, up-to-date responses from the world's leading AI providers.

## 🎯 Available AI Providers

### 1. **OpenAI** (Recommended)
- **Models:** GPT-4, GPT-3.5-turbo, GPT-4o
- **Best for:** Analysis, research, complex reasoning
- **Cost:** ~$0.03-0.06 per 1K tokens
- **Setup:** 2 minutes

### 2. **Anthropic** (Claude)
- **Models:** Claude-3-Sonnet, Claude-3-Haiku, Claude-3-Opus
- **Best for:** Safety-focused tasks, ethical analysis
- **Cost:** ~$0.015-0.075 per 1K tokens
- **Setup:** 2 minutes

### 3. **Google AI** (Gemini)
- **Models:** Gemini Pro, Gemini Flash
- **Best for:** Multimodal tasks, Google ecosystem integration
- **Cost:** Free tier available, then ~$0.0005-0.0025 per 1K tokens
- **Setup:** 3 minutes

### 4. **Hugging Face** (Free)
- **Models:** Thousands of open-source models
- **Best for:** Specialized tasks, cost-effective
- **Cost:** Free (with rate limits)
- **Setup:** 1 minute

## 🔧 Quick Setup (Choose Your Provider)

### Option 1: OpenAI (Most Popular)

1. **Get API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up/login and create an API key
   - Copy the key (starts with `sk-`)

2. **Add to Environment:**
   ```bash
   # Add to your .env.local file
   OPENAI_API_KEY=sk-your-api-key-here
   ```

3. **Test:**
   - Deploy and run any agent
   - Check console logs for "✅ OpenAI API available"

### Option 2: Anthropic (Claude)

1. **Get API Key:**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Sign up/login and create an API key
   - Copy the key (starts with `sk-ant-`)

2. **Add to Environment:**
   ```bash
   # Add to your .env.local file
   ANTHROPIC_API_KEY=sk-ant-your-api-key-here
   ```

3. **Test:**
   - Deploy and run any agent
   - Check console logs for "✅ Anthropic API available"

### Option 3: Google AI (Gemini)

1. **Get API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with Google account
   - Create an API key
   - Copy the key

2. **Add to Environment:**
   ```bash
   # Add to your .env.local file
   GOOGLE_AI_API_KEY=your-google-ai-key
   ```

3. **Test:**
   - Deploy and run any agent
   - Check console logs for "✅ Google AI API available"

### Option 4: Hugging Face (Free)

1. **Get API Key:**
   - Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Sign up/login and create an access token
   - Copy the token

2. **Add to Environment:**
   ```bash
   # Add to your .env.local file
   HUGGINGFACE_API_KEY=hf_your-token-here
   ```

3. **Test:**
   - Deploy and run any agent
   - Check console logs for "✅ Hugging Face API available"

## 🌟 Multiple Provider Setup (Recommended)

For maximum reliability and best results, set up multiple providers:

```bash
# .env.local
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key
HUGGINGFACE_API_KEY=hf_your-huggingface-token
```

**Benefits:**
- Automatic fallback if one provider fails
- Best provider selection based on task type
- Cost optimization
- Redundancy and reliability

## 🎯 Provider Selection Logic

The system automatically chooses the best provider:

- **Analysis/Research tasks** → OpenAI (best reasoning)
- **Safety/Ethical tasks** → Anthropic (Claude's strength)
- **Multimodal tasks** → Google (Gemini's strength)
- **Cost-sensitive tasks** → Hugging Face (free)
- **Fallback** → Mock AI (always available)

## 💰 Cost Estimation

### Monthly Costs (Typical Usage)

| Provider | 1K Tasks/Month | 5K Tasks/Month | 10K Tasks/Month |
|----------|----------------|----------------|-----------------|
| OpenAI GPT-4 | $60-120 | $300-600 | $600-1200 |
| OpenAI GPT-3.5 | $15-30 | $75-150 | $150-300 |
| Anthropic Claude | $30-75 | $150-375 | $300-750 |
| Google Gemini | $5-25 | $25-125 | $50-250 |
| Hugging Face | $0 | $0 | $0 |

### Cost Optimization Tips

1. **Start with Hugging Face** (free) for testing
2. **Use GPT-3.5** for simple tasks, GPT-4 for complex ones
3. **Set up usage limits** in your provider dashboard
4. **Monitor usage** with the dashboard analytics

## 🚀 Deploy with Real AI

1. **Add your API keys to .env.local**
2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
3. **Test your agents** - they'll now use real AI!

## 📊 Real-Time Features

With real AI, your agents will now provide:

### 🏈 Sports Agent
- **Real-time scores** and game updates
- **Current player statistics**
- **Live transfer news**
- **Upcoming match schedules**

### 🚀 Startup News Agent
- **Latest funding rounds**
- **Real company valuations**
- **Current market trends**
- **Live tech announcements**

### 📊 Market Analysis Agent
- **Real-time market data**
- **Current stock prices**
- **Live economic indicators**
- **Up-to-date company metrics**

### 🕵️ Competitor Monitor Agent
- **Live competitor activities**
- **Real-time product launches**
- **Current pricing changes**
- **Active market movements**

## 🔍 Monitoring & Debugging

### Check Provider Status
```bash
# View console logs during deployment
vercel logs --follow
```

### Test Individual Providers
```bash
# Test OpenAI
curl -X POST https://your-app.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test message","provider":"openai"}'
```

### Monitor Usage
- **OpenAI:** [Usage Dashboard](https://platform.openai.com/usage)
- **Anthropic:** [Console](https://console.anthropic.com/)
- **Google:** [AI Studio](https://makersuite.google.com/app/apikey)
- **Hugging Face:** [Settings](https://huggingface.co/settings/tokens)

## 🛠️ Troubleshooting

### Common Issues

1. **"Provider not available"**
   - Check API key is correct
   - Verify key has proper permissions
   - Ensure key is added to .env.local

2. **Rate limiting**
   - Upgrade to paid plan
   - Reduce request frequency
   - Use multiple providers

3. **High costs**
   - Switch to cheaper models
   - Use Hugging Face for simple tasks
   - Set up usage alerts

### Support

- **OpenAI:** [Help Center](https://help.openai.com/)
- **Anthropic:** [Documentation](https://docs.anthropic.com/)
- **Google:** [AI Studio Help](https://ai.google.dev/docs)
- **Hugging Face:** [Documentation](https://huggingface.co/docs)

## 🎉 Next Steps

1. **Choose your provider(s)** and get API keys
2. **Add keys to .env.local**
3. **Deploy to Vercel**
4. **Test your agents** with real AI
5. **Monitor usage** and optimize costs
6. **Enjoy real-time, intelligent responses!**

---

**Ready to upgrade?** Start with OpenAI for the best experience, or Hugging Face for free testing! 