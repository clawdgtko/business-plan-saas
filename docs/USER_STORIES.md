# User Stories - Business Plan SaaS

## Epic 1: Formulaire Multi-Étapes

### US-001: Étape 1 - Informations Entreprise
**En tant qu'** entrepreneur  
**Je veux** renseigner les informations de mon entreprise  
**Afin de** personnaliser mon business plan

#### Critères d'acceptation
- [ ] Champs obligatoires:
  - Nom de l'entreprise (texte libre)
  - SIRET (14 chiffres, validation API INSEE)
  - Forme juridique (dropdown: SARL, SAS, SASU, EURL, SNC, Auto-entrepreneur)
  - Secteur d'activité (dropdown 20+ secteurs)
  - Date de création (date picker)
  - Adresse du siège social (autocomplete API)
- [ ] Validation en temps réel avec messages d'erreur clairs
- [ ] Auto-save toutes les 5 secondes (localStorage)
- [ ] Temps de complétion moyen < 2 minutes
- [ ] Bouton "Continuer" désactivé jusqu'à validation complète

#### Notes techniques
- API INSEE: https://api.insee.fr/catalogue/
- Gestion des erreurs: SIRET invalide = message "Ce numéro SIRET n'est pas valide"

---

### US-002: Étape 2 - Modèle Économique
**En tant qu'** entrepreneur  
**Je veux** décrire mon modèle économique  
**Afin de** structurer ma stratégie commerciale

#### Critères d'acceptation
- [ ] Champs:
  - Description du produit/service (textarea, max 500 chars)
  - Clientèle cible (segments: B2B, B2C, B2B2C)
  - Canaux de distribution (multi-select)
  - Proposition de valeur unique (textarea)
  - Avantages concurrentiels (textarea)
- [ ] Aide contextuelle avec exemples par secteur
- [ ] Suggestions AI pour améliorer le wording (optionnel MVP+1)
- [ ] Barre de progression visible (Étape 2/3)
- [ ] Bouton retour pour modifier étape 1

---

### US-003: Étape 3 - Projections Financières
**En tant qu'** entrepreneur  
**Je veux** saisir mes projections financières  
**Afin d'** obtenir des tableaux financiers professionnels

#### Critères d'acceptation
- [ ] Champs par année (N, N+1, N+2):
  - Chiffre d'affaires prévisionnel
  - Coûts fixes (loyer, salaires...)
  - Coûts variables (achats, commission...)
  - Investissements initiaux
  - Besoin en fonds de roulement
- [ ] Calculs automatiques:
  - Seuil de rentabilité
  - BFR estimé
  - Trésorerie de départ nécessaire
- [ ] Graphiques de preview (camembert répartition coûts, courbe CA)
- [ ] Import depuis Excel/CSV (optionnel)
- [ ] Modèles pré-remplis par secteur

---

## Epic 2: Génération & Preview

### US-004: Preview Live
**En tant qu'** utilisateur  
**Je veux** voir un aperçu de mon business plan  
**Afin de** valider la qualité avant achat

#### Critères d'acceptation
- [ ] Preview des 3 premières pages uniquement
- [ ] Watermark "PREVIEW - DOCUMENT NON CONTRACTUEL" sur chaque page
- [ ] Qualité réduite (72 DPI) vs PDF final (300 DPI)
- [ ] CTA clair: "Débloquer le PDF complet pour 2,90€"
- [ ] Temps de génération du preview < 5 secondes

---

### US-005: Paiement Trial
**En tant qu'** utilisateur  
**Je veux** payer 2,90€ pour obtenir mon business plan complet  
**Afin de** recevoir mon PDF sans engagement

#### Critères d'acceptation
- [ ] Stripe Express Checkout intégré
- [ ] Paiement en 2 clics maximum
- [ ] Options: Carte, Apple Pay, Google Pay
- [ ] Email de confirmation avec:
  - Lien de téléchargement sécurisé (valide 24h)
  - Récapitulatif de la commande
  - CTA vers abonnement
- [ ] Page de succès avec téléchargement immédiat
- [ ] Génération PDF final < 30 secondes après paiement

---

## Epic 3: Dashboard & Subscription

### US-006: Dashboard Utilisateur
**En tant qu'** abonné  
**Je veux** accéder à un dashboard  
**Afin de** gérer mes business plans

#### Critères d'acceptation
- [ ] Liste des business plans générés avec date
- [ ] Téléchargement des PDF
- [ ] Dupliquer un business plan existant
- [ ] Supprimer un business plan
- [ ] Statut de l'abonnement visible

---

### US-007: Conversion Trial → Subscription
**En tant qu'** utilisateur trial  
**Je veux** m'abonner facilement  
**Afin de** bénéficier de business plans illimités

#### Critères d'acceptation
- [ ] CTA visible dans le dashboard et les emails
- [ ] Tarif clair: 39,80€/mois sans engagement
- [ ] Stripe Checkout pour l'abonnement
- [ ] Remise première année: -20% (optionnel)
- [ ] Email de bienvenue abonné avec tips utilisation

---

## Notes de Priorisation

### Sprint 1 (MVP Must-Have)
- US-001, US-002, US-003, US-004, US-005

### Sprint 2 (MVP Should-Have)
- US-006, US-007

### Post-MVP
- Édition post-génération
- Export Word
- Support multi-langues
- API publique
