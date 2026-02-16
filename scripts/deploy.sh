#!/bin/bash
# Deploy script for Business Plan SaaS
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENV=${1:-production}
WORKDIR="$(dirname "$0")/../worker"

echo "🚀 Deploying Business Plan SaaS to $ENV..."

cd "$WORKDIR"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler is not installed. Installing..."
    npm install -g wrangler
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please login to Cloudflare:"
    wrangler login
fi

# Deploy
echo "📦 Installing dependencies..."
npm ci

if [ "$ENV" == "staging" ]; then
    echo "🧪 Deploying to STAGING..."
    wrangler deploy --env staging
    echo "✅ Staging deployed: https://apps-bpsaas-staging.clawdgtko-2a7.workers.dev"
else
    echo "🚀 Deploying to PRODUCTION..."
    wrangler deploy
    echo "✅ Production deployed: https://apps-bpsaas.clawdgtko-2a7.workers.dev"
fi

echo ""
echo "🎉 Deployment complete!"
