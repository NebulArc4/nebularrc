# ArcBrain Vercel Deployment Guide

This guide will help you deploy the ArcBrain Decision Intelligence Platform to Vercel with MongoDB Atlas.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new project called "ArcBrain"
3. Create a new cluster (M0 Free tier is sufficient for development)
4. Choose your preferred cloud provider and region

### 1.2 Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Set privileges to "Read and write to any database"
5. Click "Add User"

### 1.3 Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 1.4 Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `arcbrain`

Your connection string should look like:
```
mongodb+srv://username:password@cluster.mongodb.net/arcbrain?retryWrites=true&w=majority
```

## Step 2: Deploy to Vercel

### 2.1 Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your ArcBrain code

### 2.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arcbrain?retryWrites=true&w=majority
DB_NAME=arcbrain
NEXT_PUBLIC_API_URL=/api/arcbrain
```

**Important**: Replace the MongoDB URI with your actual connection string from Step 1.4.

### 2.3 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Wait for the deployment to complete

## Step 3: Initialize the Database

After deployment, you need to initialize your MongoDB database with collections and sample data.

### 3.1 Using MongoDB Atlas Interface

1. Go to your MongoDB Atlas cluster
2. Click "Browse Collections"
3. Create the following collections:
   - `decisions`
   - `templates`
   - `collaborations`
   - `users`
   - `organizations`

### 3.2 Add Sample Templates (Optional)

You can add sample templates using the MongoDB Atlas interface or by making API calls to your deployed application.

## Step 4: Test Your Deployment

### 4.1 Health Check

Visit: `https://your-app.vercel.app/api/arcbrain?path=health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4.2 Test the Frontend

1. Visit your Vercel deployment URL
2. Navigate to `/dashboard/arc-brain`
3. Try creating a decision in the Finance Brain
4. Test the AI analysis feature

## Step 5: Custom Domain (Optional)

1. In your Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `DB_NAME` | Database name (usually `arcbrain`) | Yes |
| `NEXT_PUBLIC_API_URL` | API base URL (usually `/api/arcbrain`) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |
| `GROQ_API_KEY` | Groq API key for AI features | No |
| `FINNHUB_API_KEY` | Finnhub API key for market data | No |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string
   - Ensure network access allows connections from anywhere
   - Verify database user credentials

2. **API Endpoints Not Working**
   - Check environment variables in Vercel
   - Verify the API route is deployed correctly
   - Check Vercel function logs

3. **Frontend Not Loading**
   - Check build logs in Vercel
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Debugging

1. **Check Vercel Function Logs**
   - Go to your Vercel project
   - Click on "Functions" tab
   - Check logs for `/api/arcbrain`

2. **Test API Endpoints**
   - Use tools like Postman or curl
   - Test each endpoint individually
   - Check response status codes

3. **Database Issues**
   - Use MongoDB Atlas interface to check collections
   - Verify indexes are created
   - Check for connection limits

## Performance Optimization

1. **Enable Caching**
   - Add caching headers in your API responses
   - Use Vercel's edge caching

2. **Database Optimization**
   - Create indexes for frequently queried fields
   - Use connection pooling
   - Monitor query performance

3. **Image Optimization**
   - Use Next.js Image component
   - Optimize images before upload

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Vercel's environment variable encryption
   - Rotate API keys regularly

2. **Database Security**
   - Use strong passwords for database users
   - Enable MongoDB Atlas security features
   - Consider IP whitelisting for production

3. **API Security**
   - Implement authentication (future enhancement)
   - Add rate limiting
   - Validate all inputs

## Monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics for performance monitoring
   - Monitor function execution times

2. **MongoDB Atlas Monitoring**
   - Use Atlas monitoring tools
   - Set up alerts for performance issues

3. **Error Tracking**
   - Consider adding error tracking (Sentry, etc.)
   - Monitor API error rates

## Next Steps

After successful deployment:

1. **Add Authentication**
   - Implement user authentication
   - Add role-based access control

2. **Real AI Integration**
   - Replace mock AI with real OpenAI/Groq integration
   - Add more sophisticated analysis

3. **Advanced Features**
   - Real-time collaboration
   - Advanced analytics
   - Mobile app

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel and MongoDB Atlas documentation
3. Check the project's GitHub issues
4. Contact support if needed

---

**Congratulations!** Your ArcBrain Decision Intelligence Platform is now deployed and ready to use! 🎉 