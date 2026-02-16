# Business Plan SaaS 🚀

> **Mission** : Atteindre 1M€ MRR en codant vite et bien.

## Stack Technique

- **Backend** : Cloudflare Workers + Hono + D1
- **Frontend** : Vue.js 3 + Vite
- **Payment** : Stripe Express Checkout
- **Export** : PDF Generation

## Structure du Projet

```
business-plan-saas/
├── worker/          # Backend CFW (Hono)
├── frontend/        # Frontend Vue.js
├── package.json     # Root workspace
└── README.md
```

## Démarrage Rapide

```bash
# Install dependencies
npm install

# Run dev (worker + frontend)
npm run dev

# Deploy worker
npm run deploy
```

## Features (Roadmap)

- [ ] Setup initial (CFW + Hono + Vue.js)
- [ ] Database D1 + Migrations
- [ ] Auth (Magic Link)
- [ ] Funnel Business Plan (étapes)
- [ ] Stripe Express Checkout
- [ ] Export PDF
- [ ] Dashboard utilisateur

## Équipe

- **Lead Dev** : Architecture & Reviews
- **Fullstack Dev** : Feature delivery

---
*Let's build a unicorn* 🦄