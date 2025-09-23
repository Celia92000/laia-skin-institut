# 💬 Configuration WhatsApp Business API

## 🎯 3 Options disponibles

### Option 1 : Twilio (RECOMMANDÉ - Plus simple)
**Coût** : ~0.005€/message
**Temps de setup** : 30 minutes

### Option 2 : Meta WhatsApp Business API (Officiel)
**Coût** : Gratuit jusqu'à 1000 conversations/mois
**Temps de setup** : 2-3 jours (validation Meta)

### Option 3 : WATI (No-code)
**Coût** : 39€/mois minimum
**Temps de setup** : 1 heure

---

## 🚀 Configuration avec TWILIO (Recommandé)

### 1️⃣ Créer un compte Twilio

1. Allez sur **https://www.twilio.com/try-twilio**
2. Créez un compte gratuit (15$ de crédit offerts)
3. Vérifiez votre email et numéro de téléphone

### 2️⃣ Activer WhatsApp Sandbox (pour tester)

1. Dans le dashboard Twilio, allez dans :
   **Messaging → Try it out → Send a WhatsApp message**

2. Suivez les instructions pour connecter votre WhatsApp :
   - Envoyez `join <mot-code>` au numéro Twilio WhatsApp
   - Vous recevrez une confirmation

3. Notez le numéro WhatsApp Sandbox : `+1 415 523 8886`

### 3️⃣ Récupérer vos identifiants

Dans Twilio Console :
- **Account SID** : `ACxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token** : `xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **WhatsApp Number** : `whatsapp:+14155238886`

### 4️⃣ Ajouter les variables d'environnement

Ajoutez dans `.env.local` :

```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
WHATSAPP_PROVIDER="twilio"
```

### 5️⃣ Pour la production

1. Demandez l'approbation d'un numéro WhatsApp Business
2. Soumettez vos templates de messages
3. Attendez la validation (24-48h)

---

## 🌟 Configuration avec META (WhatsApp Business API)

### Prérequis
- Compte Meta Business vérifié
- Numéro de téléphone dédié (non utilisé sur WhatsApp)

### 1️⃣ Créer une App Meta

1. Allez sur **https://developers.facebook.com**
2. Créez une nouvelle app → Type "Business"
3. Ajoutez le produit "WhatsApp"

### 2️⃣ Configurer WhatsApp Business

1. Dans votre app Meta :
   - WhatsApp → Getting Started
   - Ajoutez votre numéro de téléphone
   - Vérifiez-le par SMS

2. Récupérez :
   - **Phone number ID** : `110xxxxxxxxxx`
   - **WhatsApp Business Account ID** : `103xxxxxxxxxx`
   - **Access Token** : Générez un token permanent

### 3️⃣ Configurer les Webhooks

1. Dans Meta App → WhatsApp → Configuration :
   - **Callback URL** : `https://laia-skin-institut.vercel.app/api/whatsapp/webhook`
   - **Verify Token** : `laia-skin-2024`

2. S'abonner aux événements :
   - `messages`
   - `message_status`

### 4️⃣ Variables d'environnement

```env
# Meta WhatsApp Business API
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxx..."
WHATSAPP_PHONE_NUMBER_ID="110xxxxxxxxxx"
WHATSAPP_BUSINESS_ACCOUNT_ID="103xxxxxxxxxx"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="laia-skin-2024"
WHATSAPP_PROVIDER="meta"
```

---

## 📱 Test rapide

### Avec Twilio Sandbox

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/ACxxxxx/Messages.json" \
  -u "ACxxxxx:auth_token" \
  -d "From=whatsapp:+14155238886" \
  -d "To=whatsapp:+33612345678" \
  -d "Body=Test LAIA SKIN Institut"
```

### Avec Meta API

```bash
curl -X POST "https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "33612345678",
    "type": "text",
    "text": {"body": "Test LAIA SKIN"}
  }'
```

---

## ✅ Checklist de configuration

### Pour Twilio :
- [ ] Compte Twilio créé
- [ ] WhatsApp Sandbox activé
- [ ] Variables d'environnement ajoutées
- [ ] Test d'envoi réussi
- [ ] Approbation production demandée (optionnel)

### Pour Meta :
- [ ] App Meta créée
- [ ] Numéro WhatsApp Business vérifié
- [ ] Webhooks configurés
- [ ] Access token généré
- [ ] Templates approuvés

---

## 🎨 Templates de messages pré-approuvés

Pour la production, créez ces templates dans Twilio/Meta :

### 1. Confirmation de réservation
**Name**: `reservation_confirmation`
**Content**: 
```
Bonjour {{1}}, votre réservation du {{2}} à {{3}} est confirmée. Services: {{4}}. Total: {{5}}€. LAIA SKIN Institut
```

### 2. Rappel de RDV
**Name**: `appointment_reminder`
**Content**:
```
Rappel: Votre RDV est {{1}} à {{2}}. Services: {{3}}. LAIA SKIN Institut. Répondez STOP pour annuler.
```

### 3. Anniversaire
**Name**: `birthday_wish`
**Content**:
```
Joyeux anniversaire {{1}}! 🎂 Profitez de -10€ sur votre prochain soin ce mois-ci. LAIA SKIN Institut
```

---

## 💡 Mode actuel : DIRECT

Actuellement, le système utilise le mode **"direct"** qui :
- Génère des liens `wa.me` pour ouvrir WhatsApp
- Ne nécessite aucune configuration
- Parfait pour commencer

Pour activer l'envoi automatique, configurez Twilio ou Meta puis changez le provider dans le code.

---

## 📞 Support

### Twilio
- Documentation : https://www.twilio.com/docs/whatsapp
- Support : support@twilio.com

### Meta
- Documentation : https://developers.facebook.com/docs/whatsapp
- Support : Via Meta Business Suite

### Questions ?
L'interface WhatsApp est déjà prête dans votre dashboard admin !
Il suffit de configurer le provider pour activer l'envoi automatique.