# ⏰ Configurer la publication automatique sur Vercel

## Qu'est-ce que c'est ?

Le CRON job permet de publier automatiquement vos posts planifiés sur Instagram et Facebook à l'heure exacte que vous avez choisie.

## Comment ça marche ?

1. Vous planifiez un post pour le **14 octobre 2025 à 14h**
2. Le statut est `scheduled` (planifié)
3. **Automatiquement**, toutes les 15 minutes, Vercel vérifie s'il y a des posts à publier
4. À 14h, votre post est **publié automatiquement** sur Instagram/Facebook
5. Le statut passe à `published` (publié)

---

## Étape 1 : Ajouter le CRON sur Vercel

### 1. Créer le fichier `vercel.json` à la racine du projet

```json
{
  "crons": [{
    "path": "/api/cron/publish-scheduled-posts",
    "schedule": "*/15 * * * *"
  }]
}
```

**Explication** :
- `*/15 * * * *` = Toutes les 15 minutes
- Vercel appellera automatiquement l'API `/api/cron/publish-scheduled-posts`

### 2. Commit et push

```bash
git add vercel.json
git commit -m "✨ Add automatic social media publishing CRON"
git push
```

---

## Étape 2 : Vérifier que ça fonctionne

### Sur Vercel :

1. Allez sur https://vercel.com
2. Sélectionnez votre projet **laia-skin-institut**
3. Cliquez sur **Settings** → **Cron Jobs**
4. Vous devriez voir :
   - **Path** : `/api/cron/publish-scheduled-posts`
   - **Schedule** : `*/15 * * * *`
   - **Status** : ✅ Active

---

## Étape 3 : Tester

### Test manuel :

Vous pouvez tester manuellement en appelant l'URL :

```bash
curl -X GET "https://laia-skin-institut-as92.vercel.app/api/cron/publish-scheduled-posts" \
  -H "Authorization: Bearer zcvGhyiM376KaiSV2kVYk6lEDgAu8gKdXQc3i5mLpLc="
```

Si ça marche, vous verrez :
```json
{
  "success": true,
  "message": "2/2 posts publiés",
  "results": [...]
}
```

---

## Fréquence de vérification

Actuellement : **Toutes les 15 minutes**

Si vous voulez changer :

### Toutes les 5 minutes :
```json
"schedule": "*/5 * * * *"
```

### Toutes les heures :
```json
"schedule": "0 * * * *"
```

### Tous les jours à 9h :
```json
"schedule": "0 9 * * *"
```

---

## 📊 Suivi des publications

### Logs Vercel :

1. Allez sur https://vercel.com
2. **Deployments** → Dernier déploiement
3. **Functions** → `api/cron/publish-scheduled-posts`
4. Vous verrez tous les logs :
   - ✅ Posts publiés avec succès
   - ❌ Erreurs (token expiré, media manquant, etc.)

---

## 🔒 Sécurité

L'endpoint CRON est protégé par le secret `CRON_SECRET` déjà configuré dans vos variables d'environnement :

```
CRON_SECRET=zcvGhyiM376KaiSV2kVYk6lEDgAu8gKdXQc3i5mLpLc=
```

Seul Vercel peut appeler cet endpoint.

---

## ⚠️ Important

### Limites Instagram/Facebook :

- **Instagram** : Max 25 posts/jour
- **Facebook** : Pas de limite stricte
- **Stories** : Pas de limite

### Token expiré :

Si votre token expire (tous les 60 jours), les publications échoueront automatiquement et vous recevrez une erreur dans les logs Vercel.

**Solution** : Renouveler le token via `/admin/instagram-setup`

---

## ✅ Checklist finale

- [ ] Fichier `vercel.json` créé
- [ ] Commit et push effectués
- [ ] CRON visible dans Vercel Settings
- [ ] Test manuel réussi
- [ ] Premier post planifié créé
- [ ] Vérification dans 15 minutes que le post est publié

---

Vos posts seront maintenant publiés automatiquement ! 🎉
