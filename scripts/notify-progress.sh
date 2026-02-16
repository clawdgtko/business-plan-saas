#!/bin/bash
# notify-progress.sh - Notification de progrès pour les agents
# Usage: ./scripts/notify-progress.sh [agent] [action] [issue] [status]

AGENT=$1
ACTION=$2
ISSUE=$3
STATUS=$4

# Format du message
MESSAGE="🔄 [${AGENT}] - ${ACTION}

📋 Tâche: #${ISSUE}
✅ Fait: ${ACTION}
⏱️ Heure: $(date '+%H:%M')
📊 Statut: ${STATUS}

Dashboard: https://business-plan-dashboard.clawdgtko-2a7.workers.dev"

echo "Notification envoyée:"
echo "$MESSAGE"
