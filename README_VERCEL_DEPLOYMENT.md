# 🚀 JobPal Gemini - Vercel Deployment Guide

This version of JobPal uses Google Gemini AI instead of local Ollama models and is designed for deployment on Vercel.

## 🎯 What's Different?

- **Cloud-based**: Uses Google Gemini API instead of local Ollama
- **Serverless**: Runs on Vercel's serverless platform
- **No local setup**: No need to install Ollama or run local models
- **Scalable**: Automatically scales based on usage

## 🛠️ Prerequisites

1. **Google AI Studio Account**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create an account and get your API key ✅ (You have this!)

2. **Vercel Account**
   - Sign up at [Vercel.com](https://vercel.com/)
   - Connect your GitHub account

## 📋 Deployment Steps

### 1. Switch to Vercel Version

First, let's switch your local files to use the Vercel/Gemini version:

```bash
node switch-to-vercel.js
```

### 2. Deploy to Vercel

#### Option A: Deploy with Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from this directory:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N** (for first deployment)
   - What's your project's name? **jobpal-gemini** (or your choice)
   - In which directory is your code located? **.** (current directory)

4. Set your API key:
   ```bash
   vercel env add GOOGLE_API_KEY
   ```
   When prompted, enter: `AIzaSyDYgLUYtQj8xPG0B-qRJu4wwILm9QKBOWI`

5. Deploy to production:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure environment variables:
   - `GOOGLE_API_KEY`: `AIzaSyDYgLUYtQj8xPG0B-qRJu4wwILm9QKBOWI`
6. Deploy!

## 🧪 Testing the Deployment

1. Visit your deployed URL (Vercel will provide this)
2. You should see "JobPal AI (Gemini Version)" in the header
3. Try the demo data or upload a resume
4. Check that the AI processing works

## 🎉 Success!

Once deployed, you'll have a globally accessible AI resume optimizer powered by Google Gemini!

Your deployment URL will be something like: `https://jobpal-gemini-yourusername.vercel.app`
