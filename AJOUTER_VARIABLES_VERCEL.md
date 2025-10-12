# 🚀 Ajouter les variables Instagram/Facebook sur Vercel

## Étape 1 : Aller sur Vercel

1. Connectez-vous sur https://vercel.com
2. Sélectionnez votre projet **laia-skin-institut**
3. Cliquez sur **Settings** (Paramètres)
4. Dans le menu gauche, cliquez sur **Environment Variables**

## Étape 2 : Ajouter les variables

Ajoutez ces 6 variables une par une :

### Variable 1 : META_APP_ID
- **Name**: `META_APP_ID`
- **Value**: `24084077607882068`
- **Environment**: Cochez **Production**, **Preview**, **Development**
- Cliquez **Save**

### Variable 2 : META_APP_SECRET
- **Name**: `META_APP_SECRET`
- **Value**: `f80c4d05470e70397d8295f7187765e1`
- **Environment**: Cochez **Production**, **Preview**, **Development**
- Cliquez **Save**

### Variable 3 : FACEBOOK_PAGE_ACCESS_TOKEN
- **Name**: `FACEBOOK_PAGE_ACCESS_TOKEN`
- **Value**: `EAFWQV0qPjVQBPiJpj7rYmuxBUyUtWuO57iA1ZBSX8SPUZCQHhu1fiS5dXC2ZBHXWELS4BFqs3ZBPIaweWATrEGpnI8rkySWkYoJNpyw7gQRpZBS6pKoBerVXrUiXafZAnZAUwEvYxV0ZB7rZBWrdvPomxZBrzDZCM89pCcYQjxfAgxYWdXAaMjZByvTDZCcgpxBlNMxHSwJ0gHCGZCTTgF`
- **Environment**: Cochez **Production**, **Preview**, **Development**
- Cliquez **Save**

### Variable 4 : FACEBOOK_PAGE_ID
- **Name**: `FACEBOOK_PAGE_ID`
- **Value**: `752355921291358`
- **Environment**: Cochez **Production**, **Preview**, **Development**
- Cliquez **Save**

### Variable 5 : INSTAGRAM_ACCESS_TOKEN
- **Name**: `INSTAGRAM_ACCESS_TOKEN`
- **Value**: `EAFWQV0qPjVQBPiJpj7rYmuxBUyUtWuO57iA1ZBSX8SPUZCQHhu1fiS5dXC2ZBHXWELS4BFqs3ZBPIaweWATrEGpnI8rkySWkYoJNpyw7gQRpZBS6pKoBerVXrUiXafZAnZAUwEvYxV0ZB7rZBWrdvPomxZBrzDZCM89pCcYQjxfAgxYWdXAaMjZByvTDZCcgpxBlNMxHSwJ0gHCGZCTTgF`
- **Environment**: Cochez **Production**, **Preview**, **Development**
- Cliquez **Save**

### Variable 6 : INSTAGRAM_ACCOUNT_ID
- **Name**: `INSTAGRAM_ACCOUNT_ID`
- **Value**: `17841465917006851`
- **Environment**: Cochez **Production**, **Preview**, **Development**
- Cliquez **Save**

## Étape 3 : Redéployer

Une fois toutes les variables ajoutées :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur le dernier déploiement
3. Cliquez sur les 3 points **...** en haut à droite
4. Cliquez **Redeploy**
5. Confirmez

Ou plus simple, faites un commit et push :
```bash
git add .
git commit -m "✅ Configuration Instagram et Facebook complète"
git push
```

## Étape 4 : Vérifier

Une fois redéployé, allez sur :
```
https://laia-skin-institut-as92.vercel.app/admin/social-media
```

Et créez votre premier post Instagram ! 🎉

## ⚠️ Rappel important

Ce token expire dans **60 jours** (le 11 décembre 2025).

Pour le renouveler :
1. Retournez sur http://localhost:3001/admin/instagram-setup
2. Cliquez sur "Se connecter avec Facebook"
3. Copiez le nouveau token
4. Mettez à jour les variables sur Vercel

## 📅 Créer un rappel

Ajoutez un rappel dans votre calendrier pour le **5 décembre 2025** :
- Titre : "Renouveler token Instagram/Facebook"
- Description : "Aller sur /admin/instagram-setup et regénérer le token"
