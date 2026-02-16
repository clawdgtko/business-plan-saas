# GitHub Issues - Business Plan SaaS

Copier-coller ces issues dans GitHub pour création.

---

## Issue #1: 🏗️ Architecture Review: Setup Initial

**Labels:** `architecture`, `review`

### ✅ Setup Initial Complété

Stack mise en place:
- [x] Cloudflare Workers + Hono
- [x] Vue.js 3 + Vite + Tailwind
- [x] Routes API (auth, business-plan, stripe, export)
- [x] D1 migrations
- [x] Funnel frontend (4 étapes)

### 📋 Review Points

@LeadDev - Peux-tu reviewer:

1. **Structure** - Le mono-repo avec workspaces est OK?
2. **Routes API** - Pattern REST approprié?
3. **Funnel** - UX des 4 étapes (business-info, market, financial, review)
4. **DB Schema** - Tables users/business_plans/subscriptions/magic_links

### 🚀 Next Steps

Attente de ton GO pour:
- Feature: Auth Magic Link
- Feature: CRUD Business Plan
- Feature: Stripe Express Checkout
- Feature: Export PDF

---

## Issue #2: 🔐 Feature - Auth Magic Link

**Labels:** `feature`, `auth`, `backend`, `frontend`

### Description
Implémenter l'authentification par Magic Link (passwordless).

### Backend
- [ ] `POST /api/auth/magic-link` - Génère token, envoie email via Resend
- [ ] `GET /api/auth/verify/:token` - Vérifie token, crée JWT
- [ ] `GET /api/auth/me` - Retourne user courant
- [ ] Middleware `auth()` pour protéger les routes

### Frontend
- [ ] Page Login avec input email
- [ ] Page de vérification "Check your email"
- [ ] Gestion du token JWT (Pinia store)
- [ ] Redirection post-login

### Database
- [ ] Table `magic_links` avec expiration (15min)
- [ ] Table `users` créée à la première connexion

### Estimation: 1-2 jours

---

## Issue #3: 📝 Feature - CRUD Business Plan

**Labels:** `feature`, `backend`, `frontend`, `database`

### Description
CRUD complet des business plans avec persistance D1.

### Backend
- [ ] `GET /api/business-plans` - Liste des BP (avec auth)
- [ ] `POST /api/business-plans` - Création nouveau BP
- [ ] `GET /api/business-plans/:id` - Détails d'un BP
- [ ] `PUT /api/business-plans/:id/:section` - Mise à jour section
- [ ] `DELETE /api/business-plans/:id` - Suppression

### Frontend
- [ ] Dashboard avec liste des BP
- [ ] Funnel connecté à l'API (sauvegarde auto)
- [ ] Édition d'un BP existant
- [ ] Indicateur de progression persistant

### Database
- [ ] Table `business_plans` avec JSON `data`
- [ ] Calcul automatique du `progress`

### Estimation: 2-3 jours

---

## Issue #4: 💳 Feature - Stripe Express Checkout

**Labels:** `feature`, `stripe`, `payment`, `backend`, `frontend`

### Description
Intégration Stripe Express Checkout pour l'abonnement Pro.

### Backend
- [ ] `POST /api/stripe/checkout` - Crée session checkout
- [ ] `GET /api/stripe/subscription` - Statut abonnement
- [ ] `POST /api/stripe/portal` - Customer portal
- [ ] `POST /api/stripe/webhook` - Gère webhooks
- [ ] Middleware `requireSubscription()`

### Frontend
- [ ] Intégration Stripe Express Checkout Element
- [ ] Page de succès/annulation
- [ ] Affichage du statut d'abonnement
- [ ] Blocage export PDF si pas Pro

### Stripe Setup
- [ ] Créer produit "Business Plan Pro"
- [ ] Configurer webhook endpoint
- [ ] Tester flow complet

### Estimation: 2-3 jours

---

## Issue #5: 📄 Feature - Export PDF

**Labels:** `feature`, `export`, `backend`, `frontend`

### Description
Génération et téléchargement PDF du business plan.

### Backend
- [ ] `POST /api/export/pdf/:id` - Génère PDF
- [ ] Stockage sur R2 ou génération on-the-fly
- [ ] Template PDF professionnel

### Frontend
- [ ] Bouton "Exporter en PDF"
- [ ] Loading state pendant génération
- [ ] Téléchargement automatique
- [ ] Preview du PDF (?)

### Options techniques
- **Option A:** Puppeteer sur CF Workers (limite 50ms CPU)
- **Option B:** HTML → PDF côté client (jsPDF, html2pdf)
- **Option C:** API externe (PDFShift, DocRaptor)

### Estimation: 1-2 jours

---

## Issue #6: 🎨 Polish UI/UX

**Labels:** `design`, `frontend`, `polish`

### Description
Améliorations visuelles et UX.

- [ ] Landing page avec hero section
- [ ] Animations transitions funnel
- [ ] Responsive mobile
- [ ] Dark mode (?)
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error handling UI

### Estimation: 2 jours

---

## Issue #7: 🚀 MVP Launch

**Labels:** `launch`, `devops`

### Description
Mise en production et lancement.

- [ ] Déployer worker sur Cloudflare
- [ ] Déployer frontend sur Pages
- [ ] Configurer domaine custom
- [ ] Setup Stripe production
- [ ] Configurer Resend (email)
- [ ] Google Analytics / PostHog
- [ ] Sentry pour erreurs

### Estimation: 1 jour

---

*Issues créées par Fullstack Dev - 16/02/2026*