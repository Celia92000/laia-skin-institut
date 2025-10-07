# Configuration des Cron Jobs Vercel

## Limite actuelle
Le plan gratuit de Vercel ne permet que **2 cron jobs**. Pour déployer le site, nous avons dû limiter les cron jobs actifs.

## Cron Jobs ACTIFS (2/2)
1. **Rappels de rendez-vous** (`/api/cron/send-reminders`)
   - Heure: 20h00 tous les jours
   - Envoie les rappels par email et WhatsApp pour les RDV du lendemain

2. **Emails d'anniversaire** (`/api/cron/birthday-emails`)
   - Heure: 9h00 tous les jours
   - Envoie les emails de bon anniversaire aux clients

## Cron Jobs DÉSACTIVÉS (pour respecter la limite)
Ces cron jobs ont été commentés dans `vercel.json` mais le code existe toujours:

1. **Demandes d'avis** (`/api/cron/send-review-requests`)
   - Heure prévue: 18h00
   - Envoie les demandes d'avis après les prestations
   - Alternative: Peut être déclenché manuellement depuis l'admin

2. **Rappels WhatsApp** (`/api/cron/send-whatsapp-reminders`)
   - Alternative: Inclus dans send-reminders maintenant

## Pour réactiver les cron jobs
### Option 1: Upgrade Vercel
Passez à un plan payant Vercel Pro qui permet plus de cron jobs.

### Option 2: GitHub Actions
Créez des workflows GitHub Actions pour les cron jobs supplémentaires:

```yaml
# .github/workflows/review-requests.yml
name: Send Review Requests
on:
  schedule:
    - cron: '0 18 * * *' # 18h UTC
  workflow_dispatch:

jobs:
  send-reviews:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X POST https://votre-site.vercel.app/api/cron/send-review-requests \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 3: Services externes
- **Upstash**: Service de cron jobs gratuit jusqu'à 3 jobs
- **Cronitor**: Monitoring et exécution de cron jobs
- **EasyCron**: Service de cron jobs en ligne

## Configuration actuelle dans vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 20 * * *"  // 20h tous les jours
    },
    {
      "path": "/api/cron/birthday-emails",
      "schedule": "0 9 * * *"   // 9h tous les jours
    }
  ]
}
```