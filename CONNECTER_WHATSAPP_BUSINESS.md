# 🚀 Guide : Connecter WhatsApp Business API (Meta)

## 📋 Prérequis

- ✅ Compte Facebook Business
- ✅ Un numéro de téléphone **NON utilisé** sur WhatsApp
- ✅ Accès à ce numéro pour recevoir un SMS/appel

---

## 📱 Étape 1 : Créer votre App Meta

1. Allez sur **https://developers.facebook.com**
2. Connectez-vous avec votre compte Facebook
3. Cliquez sur **"My Apps"** → **"Create App"**

### Configuration de l'app :
- **Type** : Other → Next → Business
- **App name** : LAIA SKIN WhatsApp
- **Contact email** : Votre email
- **Business Portfolio** : Créez "LAIA SKIN Institut" ou sélectionnez existant

---

## 💬 Étape 2 : Ajouter WhatsApp à votre App

1. Dans le dashboard de votre app
2. Cliquez **"Add Product"** (ou "+" dans la sidebar)
3. Trouvez **"WhatsApp"** → Cliquez **"Set up"**
4. Suivez le Getting Started

---

## 📞 Étape 3 : Ajouter un Numéro de Téléphone

### Option A : Numéro Test (Gratuit)
1. Utilisez le numéro de test fourni
2. Limitations : 5 contacts max

### Option B : Votre Propre Numéro (Production)
1. Cliquez **"Add phone number"**
2. Entrez un numéro **qui n'est PAS sur WhatsApp**
3. **Vérification** :
   - Choisissez SMS ou Appel vocal
   - Entrez le code reçu
4. **Display name** : LAIA SKIN Institut
5. **Category** : Beauty, spa and salon services
6. **Description** : Institut de beauté et soins esthétiques

---

## 🔑 Étape 4 : Obtenir vos Identifiants

### A. Phone Number ID
1. WhatsApp → API Setup
2. Copiez le **"Phone number ID"** : `110xxxxxxxxxxxxx`

### B. WhatsApp Business Account ID  
1. WhatsApp → API Setup
2. Copiez le **"WhatsApp Business Account ID"** : `103xxxxxxxxxxxxx`

### C. Permanent Access Token
1. Dans votre App → **"System Users"** (dans Business Settings)
2. **"Add"** → Créez un utilisateur système :
   - Name : LAIA SKIN API
   - Role : Admin
3. **"Generate Token"** → Sélectionnez :
   - ✅ whatsapp_business_management
   - ✅ whatsapp_business_messaging
   - Expiration : Never
4. Copiez le token : `EAAxxxxxxxxxx...`

---

## ⚙️ Étape 5 : Configuration dans votre Application

### Dans `.env.local` :

```env
# Meta WhatsApp Business API
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxx..."  # Votre token permanent
WHATSAPP_PHONE_NUMBER_ID="110xxxxxxxxxxxxx"  # Depuis API Setup
WHATSAPP_BUSINESS_ACCOUNT_ID="103xxxxxxxxxxxxx"  # Depuis API Setup
WHATSAPP_WEBHOOK_VERIFY_TOKEN="laia-skin-2024"
WHATSAPP_PROVIDER="meta"  # Important : changez de "direct" à "meta"
```

---

## 🔗 Étape 6 : Configurer les Webhooks

1. Dans votre App Meta → WhatsApp → **Configuration**
2. **Webhook URL** : 
   ```
   https://laia-skin-institut-as92.vercel.app/api/whatsapp/webhook
   ```
3. **Verify Token** : `laia-skin-2024`
4. **Webhook fields** → Sélectionnez :
   - ✅ messages
   - ✅ message_status
   - ✅ message_template_status_update

---

## ✅ Étape 7 : Templates de Messages

### Créer vos premiers templates :

1. WhatsApp → **Message Templates** → **Create Template**
2. **Category** : Transactional
3. **Name** : appointment_reminder
4. **Language** : French
5. **Content** :
   ```
   Bonjour {{1}}, rappel de votre RDV {{2}} à {{3}}. LAIA SKIN Institut
   ```

### Templates recommandés :
- `appointment_reminder` - Rappel de RDV
- `appointment_confirmation` - Confirmation
- `birthday_offer` - Offre anniversaire
- `loyalty_reward` - Récompense fidélité

---

## 🧪 Étape 8 : Tester

### Test rapide avec cURL :

```bash
curl -X POST https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "messaging_product": "whatsapp",
  "to": "33612345678",
  "type": "text",
  "text": {
    "body": "Test LAIA SKIN Institut"
  }
}'
```

### Test avec votre app :

```bash
npx tsx test-whatsapp.ts
```

---

## ⚠️ Limites et Quotas

### Compte Non Vérifié :
- 250 contacts uniques par jour
- 1000 messages par jour

### Compte Vérifié (Business Verification) :
- Illimité (avec limites de débit)
- 1000 conversations gratuites/mois

---

## 🚨 Problèmes Fréquents

### "Token Invalid"
→ Régénérez le token avec les bonnes permissions

### "Number not registered"  
→ Le numéro doit être vérifié dans Meta Business

### "Template not approved"
→ Les templates doivent être approuvés (24-48h)

### "Webhook not verified"
→ Vérifiez que le verify_token correspond

---

## 📊 Dashboard et Monitoring

1. **Insights** : Dans Meta App → WhatsApp → Insights
2. **Logs** : Business Manager → WhatsApp → Activity
3. **Templates Status** : WhatsApp → Message Templates

---

## 🎯 Checklist Finale

- [ ] App Meta créée
- [ ] WhatsApp ajouté à l'app
- [ ] Numéro vérifié
- [ ] Token permanent généré
- [ ] Variables dans .env.local
- [ ] Webhook configuré
- [ ] Templates créés
- [ ] Test envoi réussi

---

## 📞 Support

- **Documentation** : https://developers.facebook.com/docs/whatsapp
- **Status** : https://developers.facebook.com/status/
- **Community** : https://www.facebook.com/groups/WhatsAppDevelopers

---

**💡 Conseil** : Commencez avec le numéro de test gratuit pour tout configurer, puis passez à votre numéro de production.