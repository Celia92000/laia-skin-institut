# 📱 Guide de Configuration - Réseaux Sociaux

## 🚀 Vue d'ensemble

Votre système de publication automatique est installé ! Suivez ce guide pour configurer vos comptes.

---

## 1️⃣ INSTAGRAM & FACEBOOK (Même API Meta)

### Prérequis
- Compte Instagram **Professionnel** ou **Créateur**
- Page Facebook connectée à Instagram
- Compte Meta for Developers

### Configuration (15 minutes)

#### Étape 1 : Créer l'application Meta
1. Aller sur https://developers.facebook.com/apps
2. Cliquer sur **"Créer une application"**
3. Type : **"Business"**
4. Nom : **"Laia Skin Social Publisher"**

#### Étape 2 : Ajouter les produits
1. Dans le tableau de bord → **Ajouter des produits**
2. Ajouter **Instagram Graph API**
3. Ajouter **Facebook Login**

#### Étape 3 : Obtenir le token
1. Aller dans **Outils** → **Explorateur de l'API Graph**
2. Sélectionner votre application
3. Type de token : **Token d'accès utilisateur**
4. Ajouter les permissions :
   ```
   ✓ instagram_basic
   ✓ instagram_content_publish
   ✓ pages_read_engagement
   ✓ pages_manage_posts
   ✓ publish_video
   ```
5. Cliquer sur **"Générer un token d'accès"**
6. **IMPORTANT** : Prolonger le token (60 jours → permanent)
   - Cliquer sur l'icône "ℹ️" à côté du token
   - Cliquer sur **"Ouvrir dans l'outil de débogage de token d'accès"**
   - Cliquer sur **"Prolonger le token d'accès"**

#### Étape 4 : Récupérer les IDs

**Instagram Account ID** :
```bash
https://graph.facebook.com/v18.0/me/accounts?access_token=VOTRE_TOKEN
```
Chercher : `instagram_business_account` → `id`

**Facebook Page ID** :
```bash
https://graph.facebook.com/v18.0/me/accounts?access_token=VOTRE_TOKEN
```
Chercher : `id` de votre page

#### Étape 5 : Ajouter dans .env
```env
INSTAGRAM_ACCESS_TOKEN=VOTRE_TOKEN_META
INSTAGRAM_ACCOUNT_ID=VOTRE_INSTAGRAM_ID
FACEBOOK_PAGE_ACCESS_TOKEN=VOTRE_TOKEN_META
FACEBOOK_PAGE_ID=VOTRE_PAGE_ID
```

---

## 2️⃣ SNAPCHAT

### Prérequis
- Compte Snapchat Business
- Snapchat for Business Manager

### Configuration (10 minutes)

#### Étape 1 : Créer l'application
1. Aller sur https://kit.snapchat.com/portal
2. Se connecter avec votre compte Snapchat
3. Cliquer sur **"Create App"**
4. Nom : **"Laia Skin Publisher"**
5. Type : **"Business"**

#### Étape 2 : Activer Creative Kit
1. Dans votre app → **Products**
2. Activer **"Creative Kit"**
3. Activer **"Snapchat Marketing API"**

#### Étape 3 : Générer le token
1. Aller dans **Settings** → **OAuth2**
2. Ajouter Redirect URI : `https://votre-site.com/auth/snapchat`
3. Aller dans **OAuth2 Access Tokens**
4. Cliquer sur **"Generate Token"**
5. Sélectionner les scopes :
   ```
   ✓ snapchat-marketing-api
   ✓ snapchat-profile-api
   ```
6. Copier le token généré

#### Étape 4 : Ajouter dans .env
```env
SNAPCHAT_ACCESS_TOKEN=VOTRE_TOKEN_SNAPCHAT
```

---

## 3️⃣ TIKTOK

### Prérequis
- Compte TikTok Business
- TikTok for Business

### Configuration (10 minutes)

#### Étape 1 : Créer un compte développeur
1. Aller sur https://developers.tiktok.com
2. Se connecter avec votre compte TikTok
3. Compléter le formulaire développeur

#### Étape 2 : Créer l'application
1. Dashboard → **"Create App"**
2. Nom : **"Laia Skin Social"**
3. Type : **"Web App"**

#### Étape 3 : Activer Content Posting API
1. Dans votre app → **Products**
2. Activer **"Content Posting API"**
3. Activer **"Login Kit"**

#### Étape 4 : Générer le token

**Méthode 1 : OAuth2 (Recommandé pour production)**
1. Settings → **Basic Information**
2. Noter Client Key et Client Secret
3. Redirect URL : `https://votre-site.com/auth/tiktok`
4. Scopes :
   ```
   ✓ video.upload
   ✓ video.publish
   ✓ user.info.basic
   ```

**Méthode 2 : Token de test (Développement)**
1. Dashboard → **Test Users**
2. Cliquer sur **"Generate Token"**
3. Copier le token

#### Étape 5 : Ajouter dans .env
```env
TIKTOK_ACCESS_TOKEN=VOTRE_TOKEN_TIKTOK
```

---

## 🧪 Tester votre configuration

### Dans le navigateur
```
http://localhost:3001/api/admin/social-media/test-config
```

### Ou via curl (avec votre token admin)
```bash
curl -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  http://localhost:3001/api/admin/social-media/test-config
```

### Réponse attendue :
```json
{
  "success": true,
  "configuredCount": 4,
  "configuredPlatforms": ["Instagram", "Facebook", "Snapchat", "TikTok"],
  "message": "4 plateforme(s) configurée(s)"
}
```

---

## 📝 Configuration finale

### Copier les variables dans votre .env principal
```bash
# Copier le contenu de .env.social-media dans votre .env
cat .env.social-media >> .env
```

### Redémarrer le serveur
```bash
npm run dev
```

---

## ✅ Checklist de vérification

- [ ] Token Instagram configuré
- [ ] Instagram Account ID configuré
- [ ] Token Facebook configuré
- [ ] Facebook Page ID configuré
- [ ] Token Snapchat configuré
- [ ] Token TikTok configuré
- [ ] CRON_SECRET défini
- [ ] Test de configuration réussi
- [ ] Serveur redémarré

---

## 🚀 Utilisation

1. **Aller dans Admin** → **Réseaux Sociaux**
2. **Cliquer sur une date** pour créer une publication
3. **Uploader votre image/vidéo**
4. **Choisir la plateforme** (Instagram, Facebook, Snapchat, TikTok)
5. **Programmer** ou **Publier maintenant**

---

## 🔒 Sécurité

- ⚠️ **Ne jamais commiter le fichier .env**
- ✅ Les tokens sont stockés en variables d'environnement
- ✅ Le CRON_SECRET protège les publications automatiques
- ✅ Authentification admin requise pour toutes les actions

---

## 🆘 Problèmes courants

### "Configuration manquante"
→ Vérifier que les variables sont bien dans .env et que le serveur a été redémarré

### "Token invalide"
→ Régénérer le token et prolonger sa durée (pour Meta)

### "Erreur publication Instagram"
→ Vérifier que le compte est bien en mode Professionnel/Créateur

### "Image requise pour Snapchat/TikTok"
→ Ces plateformes nécessitent obligatoirement un média

---

## 📞 Support

- Documentation Meta : https://developers.facebook.com/docs/instagram-api
- Documentation Snapchat : https://kit.snapchat.com/docs
- Documentation TikTok : https://developers.tiktok.com/doc

---

✨ **Votre système de publication automatique est prêt !**
