#!/bin/bash
# sprint-check.sh - Script de vérification du sprint
# Usage: ./scripts/sprint-check.sh

echo "🔄 Sprint Check - $(date)"
echo "========================================"

# Check git activity
echo "📊 Activité Git (dernières 24h):"
cd /home/gtko/.openclaw/workspace/business-plan-saas
git log --since="24 hours ago" --oneline --all || echo "Aucun commit récent"

echo ""
echo "📋 Issues ouvertes:"
gh issue list --repo clawdgtko/business-plan-saas --state open --limit 5

echo ""
echo "🔀 PRs ouvertes:"
gh pr list --repo clawdgtko/business-plan-saas --state open

echo ""
echo "🌿 Branches actives:"
git branch -a | grep feature | wc -l
echo "branches feature détectées"

echo ""
echo "========================================"
echo "Check terminé - $(date)"
