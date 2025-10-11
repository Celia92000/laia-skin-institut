# 📋 TODO - Intégration Réseaux Sociaux

## ✅ Déjà fait
- [x] Structure de base pour publication réseaux sociaux (`social-media-publisher.ts`)
- [x] Code pour Instagram (Meta Graph API)
- [x] Code pour Facebook (Meta Graph API)
- [x] Code pour LinkedIn
- [x] Code pour Snapchat
- [x] Interface admin pour planifier des posts (`/admin/social-media`)
- [x] Calendrier de publication
- [x] Base de données pour stocker les posts planifiés

## 🔧 À CONFIGURER - Meta for Developers (Instagram + Facebook)

### Étape 1 : Créer une App Meta
1. [ ] Aller sur https://developers.facebook.com/
2. [ ] Créer un compte développeur (si pas déjà fait)
3. [ ] Cliquer sur "Mes Apps" → "Créer une App"
4. [ ] Choisir "Business" comme type d'app
5. [ ] Renseigner le nom : "LAIA SKIN Social Publisher"
6. [ ] Noter l'`APP_ID` et l'`APP_SECRET`

### Étape 2 : Configurer Instagram Business
1. [ ] Convertir votre compte Instagram en compte Business (si pas déjà fait)
2. [ ] Lier votre page Facebook à votre compte Instagram Business
3. [ ] Dans l'app Meta, ajouter les produits :
   - [ ] Instagram Basic Display
   - [ ] Instagram Content Publishing
4. [ ] Obtenir l'`INSTAGRAM_ACCOUNT_ID`

### Étape 3 : Obtenir les Tokens
1. [ ] Dans l'app Meta → Outils → Graph API Explorer
2. [ ] Sélectionner votre app
3. [ ] Sélectionner la page Facebook liée
4. [ ] Demander les permissions :
   - [ ] `pages_manage_posts`
   - [ ] `pages_read_engagement`
   - [ ] `instagram_basic`
   - [ ] `instagram_content_publish`
5. [ ] Générer un token d'accès
6. [ ] Convertir en token longue durée (60 jours)
7. [ ] Noter le `FACEBOOK_PAGE_ACCESS_TOKEN`

### Étape 4 : Obtenir les IDs
1. [ ] Page Facebook ID :
   - Aller sur votre page → À propos → Bas de page
   - Copier l'ID de page
2. [ ] Instagram Business Account ID :
   - Dans Graph API Explorer : `GET /me/accounts`
   - Puis `GET /{PAGE_ID}?fields=instagram_business_account`
   - Noter l'ID retourné

### Étape 5 : Variables d'environnement Vercel
```env
INSTAGRAM_ACCESS_TOKEN=EAAxxxxx...
INSTAGRAM_ACCOUNT_ID=17841xxxxxx
FACEBOOK_PAGE_ACCESS_TOKEN=EAAxxxxx...
FACEBOOK_PAGE_ID=10xxxx...
META_APP_ID=xxxxx
META_APP_SECRET=xxxxx
```

## 🎯 À CONFIGURER - TikTok

### Étape 1 : TikTok for Developers
1. [ ] Aller sur https://developers.tiktok.com/
2. [ ] Créer un compte développeur
3. [ ] Créer une nouvelle app
4. [ ] Renseigner les informations de l'app
5. [ ] Noter le `CLIENT_KEY` et `CLIENT_SECRET`

### Étape 2 : OAuth et Permissions
1. [ ] Configurer l'URL de redirection OAuth
2. [ ] Demander les permissions nécessaires :
   - [ ] `video.upload`
   - [ ] `video.publish`
3. [ ] Compléter le processus d'authentification OAuth
4. [ ] Obtenir l'`ACCESS_TOKEN`

### Étape 3 : Variables d'environnement
```env
TIKTOK_CLIENT_KEY=xxxxx
TIKTOK_CLIENT_SECRET=xxxxx
TIKTOK_ACCESS_TOKEN=xxxxx
```

### Étape 4 : Code à ajouter
1. [ ] Créer fonction `publishToTikTok()` dans `social-media-publisher.ts`
2. [ ] Gérer l'upload de vidéos
3. [ ] Ajouter TikTok dans l'interface admin

## 📸 À CONFIGURER - Snapchat Business

### Étape 1 : Snapchat Business Manager
1. [ ] Aller sur https://business.snapchat.com/
2. [ ] Créer un compte Business Manager
3. [ ] Créer un Ad Account

### Étape 2 : Créer une App
1. [ ] Aller sur https://kit.snapchat.com/manage
2. [ ] Créer une nouvelle App
3. [ ] Configurer Creative Kit
4. [ ] Noter le `CLIENT_ID` et `CLIENT_SECRET`

### Étape 3 : Obtenir les Tokens
1. [ ] Configurer OAuth 2.0
2. [ ] Obtenir l'`ACCESS_TOKEN`
3. [ ] Noter l'`AD_ACCOUNT_ID`

### Étape 4 : Variables d'environnement
```env
SNAPCHAT_CLIENT_ID=xxxxx
SNAPCHAT_CLIENT_SECRET=xxxxx
SNAPCHAT_ACCESS_TOKEN=xxxxx
SNAPCHAT_AD_ACCOUNT_ID=xxxxx
```

### Étape 5 : Finaliser le code
1. [ ] Compléter la fonction `publishToSnapchat()` avec les bons endpoints
2. [ ] Gérer l'upload de médias
3. [ ] Ajouter Snapchat dans l'interface admin

## 🧪 TESTS

### Tests Instagram
1. [ ] Publier une photo avec caption
2. [ ] Publier avec hashtags
3. [ ] Vérifier l'affichage sur Instagram
4. [ ] Tester la gestion des erreurs

### Tests Facebook
1. [ ] Publier un post texte
2. [ ] Publier une photo
3. [ ] Publier un lien
4. [ ] Vérifier l'affichage sur Facebook

### Tests TikTok
1. [ ] Publier une vidéo courte
2. [ ] Ajouter une description
3. [ ] Vérifier sur TikTok

### Tests Snapchat
1. [ ] Publier une photo/vidéo
2. [ ] Vérifier sur Snapchat

## 🔒 SÉCURITÉ

1. [ ] Vérifier que tous les tokens sont dans `.env` et `.gitignore`
2. [ ] Configurer la rotation automatique des tokens
3. [ ] Ajouter des logs pour surveiller les publications
4. [ ] Implémenter rate limiting pour éviter le spam

## 📊 AMÉLIORA TIONS FUTURES

1. [ ] Analytics : récupérer les stats de chaque post
2. [ ] Réponses automatiques aux commentaires
3. [ ] Planification récurrente (ex: tous les lundis à 10h)
4. [ ] Suggestions de hashtags basées sur le contenu
5. [ ] Prévisualisation du post avant publication
6. [ ] Publication en lot (publier sur plusieurs plateformes en même temps)

## 📅 Planning

- **Session 1 (aujourd'hui terminé)** : Corrections bugs et déploiement ✅
- **Session 2 (prochaine)** : Configuration Meta (Facebook + Instagram)
- **Session 3** : Configuration TikTok
- **Session 4** : Configuration Snapchat
- **Session 5** : Tests et améliorations
