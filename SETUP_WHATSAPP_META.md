# Configuration Meta WhatsApp Business API

## 📋 Prérequis
- Compte Facebook personnel
- Numéro de téléphone non utilisé sur WhatsApp

## 🚀 Étapes de configuration

### 1. Créer un Meta Business Account
1. Allez sur https://business.facebook.com/
2. Créez un compte "LAIA SKIN Institut"
3. Vérifiez votre entreprise (peut prendre quelques jours)

### 2. Créer une Application Meta
1. Allez sur https://developers.facebook.com/apps/
2. Cliquez "Créer une application"
3. Choisissez le type "Business"
4. Nom : "LAIA SKIN CRM"
5. Email : votre email professionnel

### 3. Ajouter WhatsApp
1. Dans votre app → "Ajouter un produit"
2. Sélectionnez "WhatsApp" → "Configurer"
3. Cliquez sur "Démarrer"

### 4. Configurer le numéro de téléphone

**Option A : Utiliser le numéro de test (recommandé pour débuter)**
- Meta fournit un numéro de test
- Vous pouvez envoyer des messages à 5 numéros maximum
- Idéal pour tester

**Option B : Ajouter votre propre numéro**
- Nécessite un numéro de téléphone dédié
- Ne doit PAS être déjà utilisé sur WhatsApp
- Doit être un numéro professionnel

### 5. Obtenir vos identifiants

Dans la console Meta WhatsApp, notez :

**a) Token d'accès temporaire** (valide 24h)
- Section "API Setup" → "Temporary access token"
- Copiez ce token

**b) Phone Number ID**
- Section "API Setup" → "Phone number ID"
- Copiez cet ID

**c) WhatsApp Business Account ID**
- Section "API Setup" → "WhatsApp Business Account ID"
- Copiez cet ID

**d) App ID et App Secret**
- Paramètres → Paramètres de base
- Notez l'ID de l'application
- Cliquez "Afficher" pour voir le code secret de l'application

### 6. Générer un Token permanent

Le token temporaire expire après 24h. Pour un token permanent :

1. Allez dans "Paramètres" → "Utilisateurs du système"
2. Créez un utilisateur système "laia-skin-bot"
3. Ajoutez le rôle "Admin"
4. Générez un nouveau token :
   - Autorisations : `whatsapp_business_messaging`, `whatsapp_business_management`
   - Expiration : "Jamais" ou "60 jours" (recommandé)
5. **IMPORTANT** : Copiez ce token immédiatement (il ne sera plus visible)

### 7. Configurer le Webhook

1. Dans WhatsApp → Configuration
2. URL du webhook : `https://votre-domaine.vercel.app/api/webhooks/whatsapp`
3. Token de vérification : Créez un code secret (ex: `laia-skin-2024-secure-webhook`)
4. Cochez toutes les cases :
   - `messages`
   - `message_status`
   - `message_echoes`
   - `messaging_optins`
   - `messaging_optouts`

### 8. Ajouter des numéros de test

Si vous utilisez le numéro de test :
1. Section "Destinataires" → "Ajouter un numéro"
2. Ajoutez votre numéro de téléphone
3. Vous recevrez un code de vérification sur WhatsApp
4. Entrez le code

### 9. Mettre à jour .env.local

```bash
# Meta WhatsApp Business API
WHATSAPP_ACCESS_TOKEN="votre_token_permanent_ici"
WHATSAPP_PHONE_NUMBER_ID="votre_phone_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="votre_business_account_id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="laia-skin-2024-secure-webhook"
WHATSAPP_PROVIDER="meta"
```

### 10. Tester

1. Redémarrez votre serveur Next.js
2. Allez dans l'onglet WhatsApp
3. Envoyez un message de test
4. Vérifiez dans la console Meta que le message est bien envoyé

## 🔍 Vérification

### Test d'envoi
```bash
curl -X POST https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "33683717050",
    "type": "text",
    "text": {
      "body": "Test LAIA SKIN"
    }
  }'
```

## 📚 Ressources

- Documentation Meta : https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- Console développeur : https://developers.facebook.com/apps/
- Business Manager : https://business.facebook.com/

## ⚠️ Limitations (mode gratuit)

- **1000 conversations gratuites par mois**
- Conversation = échange dans une fenêtre de 24h
- Au-delà : ~0.005 EUR par conversation

## 🎯 Prochaines étapes après configuration

1. Vérifier votre entreprise pour lever les limitations
2. Ajouter un profil d'entreprise (logo, description)
3. Créer des templates de messages approuvés
4. Configurer les réponses automatiques

## ❓ Besoin d'aide ?

Si vous rencontrez des problèmes :
- Vérifiez que votre token n'a pas expiré
- Vérifiez que le webhook est bien configuré
- Consultez les logs dans la console Meta
