# 📊 AGENT REPORTING SYSTEM - Business Plan SaaS

**Version:** 1.0  
**Date:** 2026-02-16  
**Enforced by:** @ScrumMaster

---

## 🎯 RÈGLE D'OR

> **Chaque agent DOIT reporter son avancement toutes les 45 minutes maximum.**

Silence = Problème potentiel

---

## 📝 FORMAT DE REPORT

### Report Standard (toutes les 30-45 min)
```
📊 [@Agent] Report - [Heure]

✅ Fait depuis dernier report:
- [Action 1]
- [Action 2]

🎯 En cours:
- [Tâche en cours]

⏱️ Prochaine étape:
- [Prochaine action]

🚧 Bloqueur (si applicable):
- [Description du bloqueur]

📊 Estimation fin: [Heure estimée]
```

### Report Rapide (si peu de changement)
```
🟢 [@Agent] - Toujours sur #[Issue]
⏱️ Dernier update: [Action]
🎯 Prochaine milestone: [Quoi] dans [X] min
```

---

## ⏰ FRÉQUENCE

| Type | Fréquence | Quand |
|------|-----------|-------|
| **Report complet** | Toutes les 45 min | Après avancement significatif |
| **Check-in rapide** | Toutes les 30 min | Si peu de changement |
| **Report bloqueur** | **IMMÉDIAT** | Dès qu'un bloqueur est rencontré |
| **Report fin tâche** | **IMMÉDIAT** | Dès qu'une tâche est terminée |

---

## 🚨 SYSTÈME D'ALERTE SCRUMMASTER

### Check ScrumMaster (toutes les 10 min)

```
FOR each agent in team:
    IF last_report > 45_minutes:
        SEND rappel
        LOG "Agent silencieux"
    
    IF last_report > 60_minutes AND no_response:
        NOTIFY Gregoire
        LOG "Agent non réactif - Escalade"
```

### Niveaux d'Alerte

| Niveau | Condition | Action |
|--------|-----------|--------|
| 🟡 **Rappel** | 45 min sans report | Message direct à l'agent |
| 🟠 **Warning** | 60 min sans report | Relance + préparation escalade |
| 🔴 **Escalade** | 75 min sans report | **Notifier Grégoire immédiatement** |

---

## 📋 CHECKLIST SCRUMMASTER

### Toutes les 10 minutes:
- [ ] Vérifier dernier report de chaque agent
- [ ] Identifier agents silencieux (> 45 min)
- [ ] Envoyer rappel aux silencieux
- [ ] Mettre à jour tracking table
- [ ] Si pas de réponse après 15 min → Notifier Grégoire

### Format Rappel:
```
🔄 [@Agent] - Status update required
⏱️ Dernier report: il y a X min
📋 Tâche assignée: #[Issue]
📝 Merci de reporter votre avancement:
   - Qu'avez-vous fait ?
   - Où en êtes-vous ?
   - Un bloqueur ?
   
⏰ Deadline sprint: 10:45
```

---

## 👥 AGENTS - RESPONSABILITÉS

### @BackendAgent (#55 Security)
**Reports attendus:**
- Toutes les 30-45 min
- Immédiat si JWT config terminé
- Immédiat si tests pass

### @QAEngineer (#52 Tests Coverage)
**Reports attendus:**
- Toutes les 30-45 min
- Immédiat si % coverage connu
- Immédiat si blocage test

### @DevOpsAgent (#48 Support Tests)
**Reports attendus:**
- Toutes les 30-45 min
- Immédiat si CI/CD issue
- Immédiat si coverage report prêt

### @FrontendAgent (#66 Onboarding)
**Reports attendus:**
- Toutes les 30-45 min (optionnel)
- Immédiat si onboarding page prête
- Ou report si aide sur tests

### @UXDesigner
**Reports attendus:**
- Report au début: "Reporté au Sprint #2"
- Si aide sur tests: report d'activité

---

## 📊 TRACKING TABLE

| Agent | Issue | Dernier Report | Il y a | Status | Action |
|-------|-------|----------------|--------|--------|--------|
| @BackendAgent | #55 | - | - | 🟡 Attendu | Monitor |
| @QAEngineer | #52 | - | - | 🟡 Attendu | Monitor |
| @DevOpsAgent | #48 | - | - | 🟡 Attendu | Monitor |
| @FrontendAgent | #66 | - | - | 🟡 Attendu | Monitor |
| @UXDesigner | - | - | - | 🟢 Reporté S2 | None |

**Mise à jour:** Toutes les 10 min par @ScrumMaster

---

## 🔧 OUTILS DE TRACKING

### Commandes ScrumMaster
```bash
# Vérifier derniers commits par agent
git log --since="45 minutes ago" --pretty=format:"%h %an %s"

# Vérifier activité GitHub
gh issue view [NUMBER] --json updatedAt

# Lire memory des agents
ls -la memory/
```

### Fichiers de Tracking
- `docs/DASHBOARD.md` → Status global
- `docs/reports/RAPPORT_[DATE]_[HEURE].md` → Rapports détaillés
- `memory/AGENT_STATUS.json` → Status temps réel (à créer)

---

## ⚡ EXEMPLES DE REPORTS

### ✅ Bon Report
```
📊 [@BackendAgent] Report - 09:30

✅ Fait:
- JWT_SECRET ajouté à wrangler.toml
- Middleware auth testé localement

🎯 En cours:
- Tests d'intégration auth

⏱️ Prochaine étape:
- Push dans 10 min

🚧 Bloqueur: Aucun

📊 Estimation fin: 10:15 ✅
```

### ⚠️ Report avec Bloqueur
```
🚨 [@QAEngineer] BLOQUEUR - 09:35

❌ Bloqué sur:
- Tests Stripe échouent en local
- Erreur: "Cannot connect to test DB"

🔍 Tentatives:
- Vérifié DATABASE_URL ✓
- Redémarré services ✓

🆘 Besoin d'aide:
@DevOpsAgent peux-tu vérifier la config test ?

⏰ Impact: +15 min si résolu rapidement
```

### 🟢 Check-in Rapide
```
🟢 [@DevOpsAgent] - Toujours sur support tests
⏱️ Dernier: Aide @QAEngineer sur coverage
🎯 Prochain: Générer rapport coverage dans 10 min
```

---

## 🎓 RÈGLES D'OR

1. **Report > Silence** - Mieux vaut un report incomplet que le silence
2. **Bloqueur = Immédiat** - Pas d'attente sur les bloqueurs
3. **Fin = Immédiat** - Annoncer dès qu'une tâche est done
4. **Estimation honnête** - Dire si on va dépasser la deadline
5. **Aide = OK** - Demander de l'aide n'est pas une faiblesse

---

## 📞 ESCALADE

**Si un agent ne répond pas:**
1. Rappel à T+45 min
2. Relance à T+60 min
3. **Notifier Grégoire à T+75 min**

**Format notification Grégoire:**
```
🚨 [@Agent] Non réactif depuis [X] min
📋 Tâche: #[Issue]
⏱️ Dernière activité: [Heure/action]
🚧 Risque: [Impact sur sprint]
📝 Actions tentées: [Liste]
```

---

**Enforced by @ScrumMaster**  
**Dernière mise à jour:** 2026-02-16 09:20
