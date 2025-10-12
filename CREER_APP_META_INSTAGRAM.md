# 🚀 Créer VOTRE App Meta pour Instagram & Facebook

## Pourquoi créer une nouvelle App ?
Vous n'avez pas les droits d'administrateur sur l'app Meta actuelle (1741901383229296).
La solution la plus simple est de créer VOTRE propre App dont vous serez admin !

---

## ÉTAPE 1 : Créer une nouvelle App Meta

### 1. Aller sur Meta for Developers
```
https://developers.facebook.com/apps/create/
```

### 2. Créer l'application
1. Cliquez sur **"Créer une app"**
2. Sélectionnez le type : **"Entreprise"**
3. Cliquez **"Suivant"**

### 3. Informations de l'app
- **Nom de l'application** : `LAIA SKIN Social Media`
- **Email de contact** : Votre email professionnel
- **Compte Meta Business** : Sélectionnez votre compte ou créez-en un
- Cliquez **"Créer l'application"**

### 4. Vérification de sécurité
- Complétez le CAPTCHA
- L'app est créée ! 🎉

### 5. Noter les identifiants
Une fois l'app créée, allez dans **Paramètres → Paramètres de base** :
- Copiez l'**ID de l'application**
- Copiez la **Clé secrète de l'application**

---

## ÉTAPE 2 : Ajouter les produits nécessaires

### 1. Instagram Basic Display
1. Dans le menu gauche, cliquez **"Ajouter un produit"**
2. Cherchez **"Instagram"**
3. Cliquez **"Configurer"** sur **Instagram Basic Display**

### 2. Instagram Graph API
1. Retournez à **"Ajouter un produit"**
2. Cherchez **"Instagram Graph API"**
3. Cliquez **"Configurer"**

### 3. Facebook Login
1. **"Ajouter un produit"**
2. Cherchez **"Facebook Login"**
3. Cliquez **"Configurer"**

---

## ÉTAPE 3 : Connecter votre compte Instagram Business

### Prérequis
Votre compte Instagram doit être :
- ✅ En mode **Business** (pas Creator, pas Personnel)
- ✅ Lié à une **Page Facebook**

### Si ce n'est pas fait :

#### Sur l'app Instagram (smartphone) :
1. Allez dans **Paramètres** ⚙️
2. **Compte** → **Passer à un compte professionnel**
3. Choisissez **"Entreprise"**
4. Catégorie : **"Beauté, cosmétiques et soins personnels"**
5. **Comptes liés** → **Facebook**
6. Connectez votre Page Facebook **LAIA SKIN Institut**

---

## ÉTAPE 4 : Obtenir le token d'accès

### 1. Aller sur Graph API Explorer
```
https://developers.facebook.com/tools/explorer/
```

### 2. Sélectionner votre nouvelle App
En haut à droite :
- **Meta App** → Sélectionnez **"LAIA SKIN Social Media"** (votre nouvelle app)

### 3. Obtenir le Page Access Token
1. Cliquez sur **"Get User Access Token"**
2. Cochez toutes ces permissions :
   - ✅ `pages_show_list`
   - ✅ `pages_manage_posts`
   - ✅ `pages_read_engagement`
   - ✅ `instagram_basic`
   - ✅ `instagram_content_publish`
   - ✅ `business_management`
3. Cliquez **"Generate Access Token"**
4. Une popup s'ouvre → **Continuez en tant que...** → **OK**
5. Le token apparaît dans le champ "Access Token"

**⚠️ Copiez ce token !** Il commence par `EAAF...`

---

## ÉTAPE 5 : Obtenir les IDs nécessaires

### 1. ID de votre Page Facebook

Dans Graph API Explorer, exécutez :
```
GET /me/accounts
```

Résultat :
```json
{
  "data": [
    {
      "id": "123456789",  ← COPIEZ CET ID
      "name": "LAIA SKIN Institut"
    }
  ]
}
```

### 2. ID de votre compte Instagram Business

Dans Graph API Explorer, exécutez (remplacez `VOTRE_PAGE_ID`) :
```
GET /VOTRE_PAGE_ID?fields=instagram_business_account
```

Résultat :
```json
{
  "instagram_business_account": {
    "id": "17841xxxxx"  ← COPIEZ CET ID
  }
}
```

⚠️ Si vous obtenez une erreur "l'objet n'existe pas", c'est que votre Instagram n'est pas encore lié à votre page Facebook. Refaites l'ÉTAPE 3.

---

## ÉTAPE 6 : Convertir le token en longue durée (60 jours)

Le token actuel expire dans 1-2 heures. Convertissons-le en token longue durée !

### Méthode : Via curl

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=VOTRE_APP_ID&client_secret=VOTRE_APP_SECRET&fb_exchange_token=VOTRE_TOKEN_COURT"
```

Remplacez :
- `VOTRE_APP_ID` → l'ID de votre nouvelle app
- `VOTRE_APP_SECRET` → la clé secrète de votre app
- `VOTRE_TOKEN_COURT` → le token que vous venez de copier

**Résultat :**
```json
{
  "access_token": "EAA...nouveau_token_longue_duree",
  "token_type": "bearer",
  "expires_in": 5183944  // 60 jours !
}
```

**Copiez le nouveau token longue durée !**

---

## ÉTAPE 7 : Ajouter tout dans .env.local

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Meta Social Media (Instagram + Facebook)
# VOTRE nouvelle App Meta
META_APP_ID="VOTRE_NOUVELLE_APP_ID"
META_APP_SECRET="VOTRE_NOUVELLE_APP_SECRET"

# Facebook
FACEBOOK_PAGE_ACCESS_TOKEN="VOTRE_TOKEN_LONGUE_DUREE"
FACEBOOK_PAGE_ID="VOTRE_PAGE_FACEBOOK_ID"

# Instagram
INSTAGRAM_ACCESS_TOKEN="VOTRE_TOKEN_LONGUE_DUREE"
INSTAGRAM_ACCOUNT_ID="785663654385417"
```

Le même token sert pour Facebook ET Instagram ! ✅

---

## ÉTAPE 8 : Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

---

## ÉTAPE 9 : Tester !

### Test 1 : Vérifier le token
```bash
curl "https://graph.facebook.com/v18.0/785663654385417?fields=id,username,name&access_token=VOTRE_TOKEN"
```

Si ça marche, vous verrez :
```json
{
  "id": "785663654385417",
  "username": "laia.skin",
  "name": "LAIA SKIN Institut"
}
```

### Test 2 : Créer un post de test
1. Allez sur http://localhost:3001/admin/social-media
2. Cliquez sur une date
3. Créez un post test
4. Attendez la publication automatique !

---

## ✅ Checklist finale

- [ ] Nouvelle App Meta créée
- [ ] App ID et App Secret copiés
- [ ] Produits ajoutés (Instagram Basic Display, Graph API, Facebook Login)
- [ ] Instagram Business lié à la page Facebook
- [ ] Token d'accès généré via Graph API Explorer
- [ ] ID Page Facebook récupéré
- [ ] ID Instagram Business récupéré (785663654385417)
- [ ] Token converti en longue durée
- [ ] Variables ajoutées dans .env.local
- [ ] Serveur redémarré
- [ ] Test réussi !

---

## 🔄 Renouveler le token (tous les 60 jours)

Répétez les ÉTAPES 4, 5 et 6 tous les 60 jours.

Ou mieux : créez un **Utilisateur Système** dans Meta Business Manager pour obtenir un token permanent qui n'expire jamais !

---

## 🆘 En cas de problème

### "Instagram account not found"
→ Vérifiez que votre Instagram est bien en mode Business et lié à Facebook

### "Invalid OAuth token"
→ Le token a expiré, régénérez-le

### "Permissions required"
→ Retournez sur Graph API Explorer et cochez toutes les permissions

---

**Une fois tout ça configuré, vous pourrez publier automatiquement sur Instagram depuis votre admin ! 🎉**
