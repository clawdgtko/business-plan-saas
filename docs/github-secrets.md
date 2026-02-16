# 🔐 GitHub Secrets - Configuration Required

Ce fichier liste tous les secrets nécessaires pour le CI/CD.

## ⚠️ ACTION REQUISE

Le **Release Manager** ou le **Lead Dev** doit configurer ces secrets dans GitHub:
https://github.com/clawdgtko/business-plan-saas/settings/secrets/actions

---

## Secrets Cloudflare (OBLIGATOIRES)

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `CLOUDFLARE_API_TOKEN` | Token pour deploy Workers | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | ID du compte Cloudflare | Cloudflare Dashboard → sidebar droite |

### Créer le token Cloudflare:
1. Aller sur https://dash.cloudflare.com/profile/api-tokens
2. "Create Token"
3. "Custom token"
4. Permissions:
   - `Cloudflare Workers:Edit`
   - `Account:Read`
   - `Zone:Read` (si custom domains)
   - `D1:Edit`

---

## Secrets Stripe (TEST)

| Secret | Description | Environnement |
|--------|-------------|---------------|
| `STRIPE_SECRET_KEY_TEST` | Clé secrète test | Staging, Dev |

Où: Stripe Dashboard → Developers → API Keys → Secret key (test mode)

---

## Secrets Notifications (OPTIONNEL)

| Secret | Description | Où le configurer |
|--------|-------------|------------------|
| `SLACK_WEBHOOK_URL` | Webhook pour notifications | Slack → Apps → Incoming Webhooks |

---

## Configuration par Environnement

### GitHub Environments

Créer 2 environnements dans GitHub:
https://github.com/clawdgtko/business-plan-saas/settings/environments

1. **staging**
   - Protection: Aucune (deploy auto depuis `develop`)
   - Secrets: Hérite des repo secrets

2. **production** 
   - Protection: Required reviewers (Lead Dev + Release Manager)
   - Wait timer: 0 minutes
   - Secrets: Hérite des repo secrets

---

## Vérification

Une fois configurés, tester avec:

```bash
# Vérifier que les workflows sont valides
gh workflow run ci.yml --ref develop --dry-run
```

---

## 🔒 Sécurité

- **NE JAMAIS** commiter ces secrets
- **NE JAMAIS** les partager en clair
- Utiliser `wrangler secret put` pour les secrets Workers
- Rotations tous les 90 jours recommandé

---

*Dernière mise à jour: 2025-02-16*
*Par: @clawdgtko (DevOps)*
