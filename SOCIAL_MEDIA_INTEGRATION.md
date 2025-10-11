# Intégration des APIs Réseaux Sociaux

## 📱 Plateformes à intégrer

### 1. Meta (Facebook + Instagram)
- **Documentation :** https://developers.facebook.com/docs/instagram-api
- **Étapes :**
  1. Créer une app Meta for Developers
  2. Configurer Instagram Business Account
  3. Obtenir les tokens d'accès
  4. Configurer les permissions (pages_manage_posts, instagram_basic, instagram_content_publish)

### 2. TikTok for Business
- **Documentation :** https://developers.tiktok.com/
- **Étapes :**
  1. S'inscrire sur TikTok for Developers
  2. Créer une application
  3. Obtenir l'API Key et Secret
  4. Configurer OAuth 2.0

### 3. Snapchat Business
- **Documentation :** https://businesshelp.snapchat.com/s/article/business-manager-api
- **Étapes :**
  1. Créer un compte Snapchat Business Manager
  2. Créer une app
  3. Obtenir les credentials
  4. Configurer l'API Marketing

## 🔧 Variables d'environnement à ajouter

```env
# Meta (Facebook + Instagram)
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ACCOUNT_ID=

# TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=

# Snapchat
SNAPCHAT_CLIENT_ID=
SNAPCHAT_CLIENT_SECRET=
SNAPCHAT_ACCESS_TOKEN=
SNAPCHAT_AD_ACCOUNT_ID=
```

## 📋 Fonctionnalités à implémenter

- [ ] Connexion aux APIs
- [ ] Publication de posts (texte + image)
- [ ] Planification de posts
- [ ] Récupération des statistiques
- [ ] Gestion des erreurs et retry
- [ ] Interface admin pour gérer les connexions

## 🎯 Prochaine session

1. Commencer par Meta (Facebook + Instagram) - le plus utilisé
2. Puis TikTok
3. Puis Snapchat
4. Tester chaque intégration
