#!/bin/bash
# Setup Vercel environment variables for StudyFlow
# Run this from the ~/StudyFlow directory after installing Vercel CLI

echo "Setting up Vercel environment variables for StudyFlow..."
echo ""
echo "This will add the required environment variables to your Vercel project."
echo "You'll need your Supabase Service Role Key and Anthropic API Key ready."
echo ""

# Supabase URL (public - same for all environments)
echo "https://ocokoemfmdodzftqbjim.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

# Supabase Anon Key (public - same for all environments)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jb2tvZW1mbWRvZHpmdHFiamltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTA2NjgsImV4cCI6MjA4ODE4NjY2OH0.YQPrNUVDCgIDYP5054PoRdnDyph70gPcNJZSlHjbUH8" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

# App URL - will be set after first deploy
echo "https://study-flow.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo ""
echo "Now enter your secrets (these won't be shown):"
echo ""

# Supabase Service Role Key (secret)
echo "Enter your Supabase Service Role Key (find in Supabase Dashboard > Settings > API):"
read -s SUPABASE_KEY
echo "$SUPABASE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
echo "✓ SUPABASE_SERVICE_ROLE_KEY added"

# Anthropic API Key (secret)
echo ""
echo "Enter your Anthropic API Key (from console.anthropic.com):"
read -s ANTHROPIC_KEY
echo "$ANTHROPIC_KEY" | vercel env add ANTHROPIC_API_KEY production preview development
echo "✓ ANTHROPIC_API_KEY added"

echo ""
echo "✅ All environment variables have been set!"
echo ""
echo "Now redeploy with: vercel --prod"
