# 🚀 Déploiement Business Plan SaaS

## URL de Production

🔗 **https://apps-bpsaas.clawdgtko-2a7.workers.dev**

## Infrastructure

- **Worker Cloudflare**: `apps-bpsaas`
- **Base de données D1**: `business-plan-db-prod`
- **Environnement**: Production

## Secrets Configurés

| Secret | Status | Description |
|--------|--------|-------------|
| `JWT_SECRET` | ✅ | Clé de signature JWT |
| `STRIPE_SECRET_KEY` | ✅ | Clé secrète Stripe |
| `STRIPE_PUBLISHABLE_KEY` | ✅ | Clé publique Stripe |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Secret webhook Stripe |
| `RESEND_API_KEY` | ✅ | Clé API Resend (email) |

## CI/CD Pipeline

Le déploiement est entièrement automatisé via GitHub Actions :

### Workflow
1. **Test** → Lint + Type check sur chaque push/PR
2. **Staging** → Déploiement automatique sur PR
3. **Production** → Déploiement automatique sur merge vers `main`

### Fichiers
- `.github/workflows/deploy.yml` - Configuration GitHub Actions
- `scripts/deploy.sh` - Script de déploiement manuel

## Déploiement Manuel

```bash
# Déploiement production
./scripts/deploy.sh production

# Déploiement staging
./scripts/deploy.sh staging
```

Ou directement avec wrangler :

```bash
cd worker
wrangler deploy          # Production
wrangler deploy --env staging  # Staging
```

## Endpoints API

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check général |
| `GET /health` | Status santé |
| `POST /api/auth/*` | Authentification |
| `GET /api/business-plans` | Business plans |
| `POST /api/stripe/*` | Paiements Stripe |
| `POST /api/export/*` | Export PDF |
| `POST /api/onboarding/*` | Onboarding |
| `GET /api/analytics/*` | Analytics |

## Monitoring

- Worker logs: `wrangler tail`
- Dashboard Cloudflare: https://dash.cloudflare.com

## Notes

⚠️ **Important**: Les secrets Stripe actuels sont des placeholders. Remplacer par les vraies valeurs avant d'activer les paiements.

```bash
# Mettre à jour les secrets Stripe
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_PUBLISHABLE_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```
