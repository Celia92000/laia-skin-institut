# 📸 Configurer Instagram & Facebook sur votre compte Meta existant

## ✅ Vous avez déjà
- Compte Meta Business (utilisé pour WhatsApp)
- App ID: **1741901383229296**
- Token Meta qui fonctionne

## 🎯 Ce qu'on va ajouter
- Publication automatique sur Instagram
- Publication automatique sur Facebook

---

## ÉTAPE 1: Connecter votre Page Facebook

### 1. Aller sur Meta Business Suite
```
https://business.facebook.com/settings/pages
```

### 2. Ajouter votre Page Facebook LAIA SKIN
- Cliquez sur **"Ajouter des pages"**
- Recherchez votre page **"LAIA SKIN Institut"**
- Cliquez sur **"Ajouter une page"**

### 3. Vérifier que la page est bien connectée
- Elle devrait apparaître dans la liste des pages
- Notez l'**ID de la page** (vous en aurez besoin)

---

## ÉTAPE 2: Connecter votre compte Instagram Business

### 1. Convertir votre compte Instagram en Business (si pas déjà fait)
Sur l'app Instagram mobile:
1. Allez dans **Paramètres** ⚙️
2. **Compte** → **Passer à un compte professionnel**
3. Choisissez **"Entreprise"**
4. Sélectionnez la catégorie **"Beauté, cosmétiques et soins personnels"**

### 2. Connecter Instagram à votre Page Facebook
Toujours sur Instagram mobile:
1. **Paramètres** → **Compte**
2. **Comptes liés** → **Facebook**
3. Connectez-vous et autorisez la connexion
4. Sélectionnez votre page **LAIA SKIN Institut**

---

## ÉTAPE 3: Configurer l'App Meta pour Instagram et Facebook

### 1. Aller sur votre App Meta existante
```
https://developers.facebook.com/apps/1741901383229296/
```

### 2. Ajouter les produits Instagram et Facebook
Dans le menu de gauche:
1. Cliquez sur **"Ajouter un produit"**
2. Cherchez et ajoutez:
   - ✅ **Instagram Graph API**
   - ✅ **Facebook Login**
   - ✅ **Pages API** (pour publier sur Facebook)

---

## ÉTAPE 4: Obtenir les tokens et IDs

### 1. Aller sur Graph API Explorer
```
https://developers.facebook.com/tools/explorer/
```

### 2. Sélectionner votre App
- En haut à droite: **Meta App** → Sélectionnez **"votre app WhatsApp"**
- User or Page: Sélectionnez **"Get Page Access Token"**
- Choisissez votre page **LAIA SKIN Institut**

### 3. Demander les permissions nécessaires
Cliquez sur **"Permissions"** et cochez:
- ✅ `pages_manage_posts` (pour publier sur Facebook)
- ✅ `pages_read_engagement` (pour voir les stats)
- ✅ `instagram_basic` (accès de base Instagram)
- ✅ `instagram_content_publish` (pour publier sur Instagram)
- ✅ `business_management` (gestion du compte Business)

Cliquez sur **"Generate Access Token"**

### 4. Copier le token généré
⚠️ **IMPORTANT**: Ce token va expirer. On va le convertir en token longue durée.

---

## ÉTAPE 5: Convertir en token longue durée (60 jours)

### Option 1: Via Graph API Explorer
1. Dans Graph API Explorer, allez sur cette URL:
```
GET /oauth/access_token?grant_type=fb_exchange_token&client_id=VOTRE_APP_ID&client_secret=VOTRE_APP_SECRET&fb_exchange_token=VOTRE_TOKEN_COURT
```

### Option 2: Via curl
```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=VOTRE_APP_ID&client_secret=VOTRE_APP_SECRET&fb_exchange_token=VOTRE_TOKEN_COURT"
```

Remplacez:
- `VOTRE_APP_ID` → votre App ID Meta
- `VOTRE_APP_SECRET` → trouvez-le dans **Paramètres de l'app** → **Paramètres de base**
- `VOTRE_TOKEN_COURT` → le token que vous venez de générer

**Résultat**: Vous obtiendrez un nouveau token qui dure 60 jours ! 🎉

---

## ÉTAPE 6: Obtenir les IDs nécessaires

### 1. ID de votre Page Facebook
Dans Graph API Explorer, exécutez:
```
GET /me/accounts
```

Vous verrez une liste avec vos pages. Copiez l'**`id`** de votre page LAIA SKIN.

### 2. ID de votre compte Instagram Business
Dans Graph API Explorer, exécutez:
```
GET /VOTRE_PAGE_ID?fields=instagram_business_account
```

Remplacez `VOTRE_PAGE_ID` par l'ID que vous venez de copier.

Vous obtiendrez quelque chose comme:
```json
{
  "instagram_business_account": {
    "id": "17841xxxxxx"
  }
}
```

Copiez cet ID !

---

## ÉTAPE 7: Ajouter les variables dans .env.local

Ouvrez votre fichier `.env.local` et ajoutez ces lignes:

```bash
# Meta Social Media (Instagram + Facebook)
# Utilise le même compte Meta Business que WhatsApp
META_APP_ID="1741901383229296"
META_APP_SECRET="VOTRE_APP_SECRET_ICI"

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN="VOTRE_TOKEN_LONGUE_DUREE"
FACEBOOK_PAGE_ID="VOTRE_PAGE_ID"

# Instagram
INSTAGRAM_ACCESS_TOKEN="VOTRE_TOKEN_LONGUE_DUREE"
INSTAGRAM_ACCOUNT_ID="VOTRE_INSTAGRAM_BUSINESS_ID"
```

---

## ÉTAPE 8: Tester la configuration

### 1. Redémarrer le serveur
```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

### 2. Tester l'API de configuration
Dans votre navigateur, allez sur:
```
http://localhost:3001/api/admin/social-media/test-config
```

Vous devriez voir si les tokens sont valides ! ✅

### 3. Créer un post de test
1. Allez sur http://localhost:3001/admin/social-media
2. Cliquez sur une date dans le calendrier
3. Créez un post de test:
   - **Titre**: Test publication
   - **Contenu**: Premier test de publication automatique depuis LAIA SKIN 🌸
   - **Plateforme**: Instagram ou Facebook
   - **Date**: Maintenant ou dans quelques minutes
   - **Statut**: Scheduled

---

## 📊 Renouveler le token (tous les 60 jours)

Votre token expire tous les 60 jours. Deux options:

### Option 1: Renouveler manuellement
Répétez l'ÉTAPE 5 tous les 60 jours.

### Option 2: Créer un token système permanent
1. Aller sur **Business Settings** → **Utilisateurs** → **Utilisateurs système**
2. Créer un utilisateur système
3. Lui donner les permissions Instagram et Facebook
4. Générer un token d'accès système (NE JAMAIS EXPIRE !)

---

## ⚠️ Points importants

1. **Même compte Meta**: Vous utilisez le même compte que WhatsApp, tout est centralisé ✅
2. **Token partagé**: Le même token peut servir pour Instagram ET Facebook
3. **Page Facebook obligatoire**: Instagram Business doit être lié à une page Facebook
4. **Compte Instagram Business**: Le compte Instagram doit être en mode Business (pas Creator, pas Personnel)

---

## 🆘 En cas de problème

### Erreur "Invalid OAuth access token"
→ Le token a expiré, régénérez-le (ÉTAPE 4-5)

### Erreur "Permissions manquantes"
→ Retournez sur Graph API Explorer et cochez toutes les permissions (ÉTAPE 4)

### Erreur "Instagram account not found"
→ Vérifiez que votre Instagram est bien:
  1. En mode Business
  2. Lié à votre page Facebook
  3. L'ID est correct

### "Cannot publish to Instagram"
→ Vérifiez que:
  1. Votre compte Instagram est vérifié
  2. Vous avez les droits de publication
  3. Le contenu respecte les guidelines Instagram

---

## 📞 Support Meta

- Documentation: https://developers.facebook.com/docs/instagram-api
- Business Support: https://business.facebook.com/business/help
- Status API: https://developers.facebook.com/status/

---

## ✅ Checklist finale

- [ ] Page Facebook LAIA SKIN connectée au Business Manager
- [ ] Compte Instagram en mode Business
- [ ] Instagram lié à la page Facebook
- [ ] Produits ajoutés dans l'App Meta (Instagram API, Facebook Login, Pages API)
- [ ] Token longue durée généré
- [ ] ID Page Facebook copié
- [ ] ID Instagram Business copié
- [ ] Variables ajoutées dans .env.local
- [ ] Serveur redémarré
- [ ] Test de configuration réussi
- [ ] Premier post de test créé

**Une fois tout ça fait, votre plateforme pourra publier automatiquement sur Instagram et Facebook ! 🎉**
