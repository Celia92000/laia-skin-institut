# 📧 Configuration des Automatisations Email

## 🚨 **État actuel : PAS ENCORE ACTIVÉES**

Les fichiers cron existent mais ne sont **PAS configurés** dans Vercel. Voici comment les activer :

## 📋 **Automatisations disponibles**

### 1. **Rappel de RDV (24h avant)**
- **Fichier** : `/src/app/api/cron/send-reminders/route.ts`
- **Fonction** : Envoie un email 24h avant chaque RDV
- **Fréquence recommandée** : Toutes les heures

### 2. **Rappel de RDV (48h avant)**  
- **Fichier** : `/src/app/api/cron/send-48h-reminders/route.ts`
- **Fonction** : Envoie un rappel 48h avant
- **Fréquence recommandée** : 1 fois par jour

### 3. **Email d'anniversaire**
- **Fichier** : `/src/app/api/cron/birthday-emails/route.ts`
- **Fonction** : Envoie un email le jour de l'anniversaire
- **Fréquence recommandée** : 1 fois par jour à 9h

### 4. **Demande d'avis après RDV**
- **Fichier** : `/src/app/api/cron/send-review-requests/route.ts`
- **Fonction** : Demande un avis 24h après le RDV
- **Fréquence recommandée** : 1 fois par jour

## 🚀 **Comment activer les automatisations**

### Option 1 : Configuration Vercel (RECOMMANDÉ)

1. **Créer le fichier `vercel.json`** (à la racine) :

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders?secret=VOTRE_SECRET_ICI",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-48h-reminders?secret=VOTRE_SECRET_ICI",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/birthday-emails?secret=VOTRE_SECRET_ICI",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/send-review-requests?secret=VOTRE_SECRET_ICI",
      "schedule": "0 10 * * *"
    }
  ]
}
```

2. **Ajouter dans Vercel Dashboard** :
   - Allez sur https://vercel.com/dashboard
   - Projet → Settings → Environment Variables
   - Ajoutez : `CRON_SECRET` = `un-mot-de-passe-securise-123`

3. **Déployer** pour activer les crons

### Option 2 : Service externe (Cron-job.org)

1. **Créer un compte gratuit** sur https://cron-job.org

2. **Créer des tâches** :
   - URL : `https://laia-skin-institut.vercel.app/api/cron/send-reminders?secret=VOTRE_SECRET`
   - Exécution : Toutes les heures

### Option 3 : Déclenchement manuel (pour tester)

```bash
# Tester l'envoi de rappels
curl https://laia-skin-institut.vercel.app/api/cron/send-reminders?secret=test123

# Tester les emails d'anniversaire
curl https://laia-skin-institut.vercel.app/api/cron/birthday-emails?secret=test123
```

## 🔧 **Variables d'environnement nécessaires**

Ajoutez dans Vercel :

```env
# Secret pour sécuriser les crons
CRON_SECRET=votre-secret-securise-ici

# Email (déjà configuré)
RESEND_API_KEY=re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR
RESEND_FROM_EMAIL=LAIA SKIN Institut <contact@laiaskininstitut.fr>

# Base de données (déjà configuré)
DATABASE_URL=postgresql://...
```

## 📊 **Syntaxe Cron**

```
* * * * *
│ │ │ │ │
│ │ │ │ └── Jour de la semaine (0-6)
│ │ │ └──── Mois (1-12)
│ │ └────── Jour du mois (1-31)
│ └──────── Heure (0-23)
└────────── Minute (0-59)
```

**Exemples** :
- `0 * * * *` : Toutes les heures
- `0 9 * * *` : Tous les jours à 9h
- `0 9 * * 1` : Tous les lundis à 9h
- `*/30 * * * *` : Toutes les 30 minutes

## ✅ **Pour vérifier que ça marche**

1. **Logs Vercel** : Dashboard → Functions → Logs
2. **Table `EmailHistory`** : Vérifiez les emails envoyés
3. **Notifications** : Vous recevrez les emails de test

## 🎯 **Statut actuel des automatisations**

| Automatisation | Fichier créé | Configuré Vercel | Activé |
|---------------|-------------|------------------|--------|
| Rappel 24h | ✅ | ❌ | ❌ |
| Rappel 48h | ✅ | ❌ | ❌ |
| Anniversaires | ✅ | ❌ | ❌ |
| Demande d'avis | ✅ | ❌ | ❌ |

## 📝 **Prochaines étapes**

1. Choisir un secret sécurisé
2. Ajouter la configuration dans `vercel.json`
3. Déployer sur Vercel
4. Vérifier les logs

**Note** : Les automatisations ne fonctionnent qu'en production (pas en local) !