# Valintakoe F — Deployment Guide

## Quick Deploy (3 minutes)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Navigate to project
```bash
cd valintakoe-app
```

### 3. Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **niclasassendelfts-projects**
- Link to existing project? **N** (create new)
- Project name? **valintakoe-app**
- Directory? **./**

### 4. Set Environment Variables

In the Vercel dashboard (or CLI), add these:

```
NEXT_PUBLIC_SUPABASE_URL=https://ocokoemfmdodzftqbjim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jb2tvZW1mbWRvZHpmdHFiamltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTA2NjgsImV4cCI6MjA4ODE4NjY2OH0.YQPrNUVDCgIDYP5054PoRdnDyph70gPcNJZSlHjbUH8
ANTHROPIC_API_KEY=<your-anthropic-api-key>
DATABASE_URL=postgresql://postgres:<password>@db.ocokoemfmdodzftqbjim.supabase.co:5432/postgres
```

### 5. Redeploy with env vars
```bash
vercel --prod
```

## Alternative: GitHub Deploy

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Add environment variables in the UI
4. Deploy

## Supabase Auth Setup

In your Supabase dashboard → Authentication → URL Configuration:
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: `https://your-vercel-url.vercel.app/**`

## Database

The database is already seeded with:
- 222 MCQ questions across 27 topics
- 58 content summaries (27 topic summaries + 27 quick reviews + 4 cheat sheets)
- 27 topics, 8 forum categories, 15 achievements
