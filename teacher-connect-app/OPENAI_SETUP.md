# 🤖 OpenAI Integration Setup Guide

## Quick Setup (5 minutes)

### Step 1: Install OpenAI Package
```bash
npm install openai
```

### Step 2: Enable OpenAI in Code
In `src/services/aiDoubtService.ts`:

1. **Uncomment the import** (line 2):
```typescript
// Change this:
// import OpenAI from 'openai' // Uncomment after installing: npm install openai

// To this:
import OpenAI from 'openai'
```

2. **Update the initOpenAI method** (around line 52):
```typescript
// Replace the initOpenAI method with:
private static async initOpenAI() {
  if (!this.openai && import.meta.env.VITE_OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default
      this.openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      })
      this.openaiAvailable = true
      console.log('OpenAI initialized successfully')
    } catch (error) {
      console.warn('OpenAI initialization failed:', error)
    }
  }
}
```

### Step 3: Get OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and get API key
3. Add $5-10 credit for testing

### Step 4: Add to Vercel Environment Variables
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add: `VITE_OPENAI_API_KEY` = `your-api-key`
3. Deploy!

## Cost Estimate
- ~$0.002 per response
- 100 questions = ~$0.20
- 1000 questions = ~$2.00

## Features You'll Get
- ✅ Real GPT-3.5-turbo responses
- ✅ Subject-specific explanations
- ✅ Grade-level appropriate language
- ✅ Fallback to demo mode if API fails

## Current Status
- ✅ Code ready for OpenAI integration
- ✅ Builds successfully without OpenAI package
- ✅ Works in demo mode
- 🔄 Ready to enable real AI with above steps
