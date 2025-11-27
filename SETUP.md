# PurrpleCalm Setup Guide

## OpenAI API Configuration

To enable Rani the Cat chat companion, you need to provide your own OpenAI API key.

### Getting Your API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (it starts with `sk-`)

### Setting Up for Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `VITE_OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
   - **Environment**: Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy your app

### Setting Up for Local Development

If running locally, create a `.env` file in the project root:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important**: Never commit your `.env` file to Git! It's already in `.gitignore`.

### Cost Information

- **Model**: GPT-4o-mini
- **Cost**: Very low (~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens)
- **Typical chat message**: ~$0.0001 - $0.0005 per message
- Each chat is limited to 150 tokens per response to keep costs minimal

### Troubleshooting

**"Please add your OpenAI API key" error:**
- Make sure you've added `VITE_OPENAI_API_KEY` to your environment variables
- For Vercel: Redeploy after adding the environment variable
- For local: Restart your dev server after creating `.env`

**"Invalid API key" error:**
- Double-check your API key is correct
- Make sure there are no extra spaces
- Verify the key is active in your OpenAI dashboard

**"Rate limit exceeded" error:**
- You've sent too many messages too quickly
- Wait a moment and try again
- Check your OpenAI usage limits

## Privacy Note

All chat data is stored **locally in your browser** using localStorage. Nothing is stored on any server except the API calls to OpenAI for generating responses.
