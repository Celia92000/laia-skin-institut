# 📱 Guide Développement WhatsApp - LAIA SKIN Institut

## 🎯 Vue d'ensemble

Votre système WhatsApp est maintenant complet avec :
- ✅ **40+ templates** professionnels
- ✅ **3 modes d'envoi** : Individuel, Campagne, Automatisation
- ✅ **Interface intuitive** intégrée
- ✅ **Twilio configuré** et testé

---

## 🚀 Comment utiliser le système

### 1️⃣ Accéder à l'interface

```
http://localhost:3001/admin
→ Marketing
→ WhatsApp
→ Onglet "Templates"
```

### 2️⃣ Les 3 modes d'envoi

#### 📤 **Envoi Individuel**
- Sélectionnez un template
- Choisissez les clients (1 ou plusieurs)
- Personnalisez les variables
- Cliquez "Envoyer"

#### 📊 **Campagne (envoi groupé)**
- Sélectionnez un template
- Choisissez un segment (VIP, Nouvelles, Fidèles...)
- Le système envoie à tous les clients du segment
- Possibilité de planifier

#### ⚡ **Automatisations**
- Rappel 24h avant RDV → Automatique
- Message anniversaire → Automatique
- Demande d'avis après soin → Automatique
- Relance clients inactifs → Automatique

---

## 📝 Templates disponibles

### Catégories et exemples :

| Catégorie | Templates | Usage |
|-----------|----------|-------|
| **Confirmations** | - Confirmation réservation<br>- Rappel 24h<br>- Rappel 2h | Automatique après réservation |
| **Fidélité** | - Bienvenue programme<br>- Points fidélité<br>- Récompense | Après inscription / achat |
| **Promotions** | - Nouvelle prestation<br>- Offre flash<br>- Vente privée VIP | Campagnes marketing |
| **Anniversaires** | - Anniversaire client<br>- Fête des mères | Automatique ou manuel |
| **Suivi** | - Suivi 24h après soin<br>- Demande d'avis<br>- Relance inactive | Automatique après service |
| **Saisonniers** | - Prépa printemps<br>- Soldes été | Campagnes saisonnières |

---

## 🔧 Architecture technique

### Fichiers créés :

```
src/
├── lib/
│   ├── whatsapp.ts                    # Logique d'envoi principale
│   └── whatsapp-templates-twilio.ts   # 40+ templates LAIA SKIN
├── components/
│   ├── WhatsAppHub.tsx                # Hub principal
│   └── WhatsAppTemplateManager.tsx    # Interface complète
└── app/api/whatsapp/
    ├── send/route.ts                   # API envoi messages
    └── webhook/route.ts                # Réception messages
```

### Comment ça marche :

```javascript
// 1. Le template est sélectionné
const template = whatsappTemplatesLAIA.confirmationReservation;

// 2. Les variables sont remplies
const message = template({
  clientName: "Sophie",
  date: "25 septembre",
  time: "14h00",
  service: "Soin Hydratant",
  price: 75
});

// 3. Le message est envoyé via Twilio
await sendWhatsAppMessage({
  to: "+33612345678",
  message: message
}, 'twilio');
```

---

## 💻 Pour développer de nouveaux templates

### Ajouter un nouveau template :

1. **Ouvrez** `src/lib/whatsapp-templates-twilio.ts`

2. **Ajoutez votre template** :
```typescript
export const whatsappTemplatesLAIA = {
  // ... templates existants ...
  
  monNouveauTemplate: (data: {
    clientName: string;
    autreVariable: string;
  }) => `✨ *LAIA SKIN Institut* ✨
  
Bonjour ${data.clientName} !

Votre message personnalisé avec ${data.autreVariable}

*LAIA SKIN* 💕`
}
```

3. **Ajoutez à la catégorie** :
```typescript
export const templateCategories = {
  // ... autres catégories ...
  maCaategorie: [
    'monNouveauTemplate'
  ]
}
```

### Personnaliser les automatisations :

Dans `src/app/api/cron/` créez :
```typescript
// send-custom-automation/route.ts
export async function GET() {
  // Récupérer les clients concernés
  const clients = await prisma.user.findMany({
    where: { /* vos conditions */ }
  });
  
  // Envoyer le template
  for (const client of clients) {
    await sendWhatsAppTemplate(
      client.phone,
      'monTemplate',
      { clientName: client.name }
    );
  }
}
```

---

## 🧪 Tester vos modifications

### Test rapide d'un template :
```bash
npx tsx -e "
import { whatsappTemplatesLAIA } from './src/lib/whatsapp-templates-twilio';

const message = whatsappTemplatesLAIA.confirmationReservation({
  clientName: 'Test',
  date: '25 sept',
  time: '14h00',
  service: 'Soin Test',
  price: 75
});

console.log(message);
"
```

### Test d'envoi réel :
```bash
npx tsx test-twilio-whatsapp.ts
```

---

## 📊 Workflow complet

### Pour une nouvelle prestation :

1. **Créer l'annonce** :
   - Templates → Promotions → Nouvelle Prestation
   - Personnaliser le nom, description, prix

2. **Envoyer la campagne** :
   - Mode Campagne
   - Segment : VIP ou Fidèles
   - Envoyer

3. **Gérer les réponses** :
   - Conversations → Voir les réponses
   - Répondre individuellement

4. **Suivi automatique** :
   - Les rappels se font automatiquement
   - Demande d'avis 24h après

---

## ⚠️ Limites actuelles (Sandbox)

| Limitation | Solution |
|------------|----------|
| Clients doivent envoyer "join fix-alone" | Normal en sandbox, disparaît en production |
| Connexion 72h | Renouveler ou passer en production |
| Numéro US (+1) | Acheter un numéro FR (~5€/mois) |

---

## 🚀 Passer en production

### 1. Acheter un numéro Twilio français
```
Twilio Console → Phone Numbers → Buy
→ France (+33)
→ ~1-5€/mois
```

### 2. Activer WhatsApp sur ce numéro
```
Messaging → WhatsApp → Request access
→ 24-48h validation
```

### 3. Mettre à jour .env.local
```env
TWILIO_WHATSAPP_FROM="whatsapp:+33XXXXXXXXX"
```

---

## 💡 Astuces de développement

### Variables disponibles dans les templates :
- `clientName` - Nom du client
- `date`, `time` - Date et heure
- `service` - Nom du service
- `price` - Prix
- `points` - Points fidélité
- `code` - Code promo
- Tout ce que vous voulez !

### Emojis recommandés :
- ✨ Nouveauté/Spécial
- 💕 Affection/Merci
- 🎁 Cadeau/Offre
- ⏰ Urgence/Rappel
- 📅 Rendez-vous
- 💆‍♀️ Soins
- 🌟 Premium/VIP

### Formatage WhatsApp :
- `*Gras*` → **Gras**
- `_Italique_` → _Italique_
- `~Barré~` → ~~Barré~~
- ` ``` Code ``` ` → Code

---

## 🔍 Debugging

### Voir les logs Twilio :
```
Twilio Console → Monitor → Logs → Messages
```

### Tester la connexion :
```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/VOTRE_ACCOUNT_SID/Messages.json" \
  -u "VOTRE_ACCOUNT_SID:VOTRE_AUTH_TOKEN" \
  -d "From=whatsapp:+14155238886" \
  -d "To=whatsapp:+33683717050" \
  -d "Body=Test depuis curl"
```

### Vérifier les variables d'env :
```bash
npx tsx -e "
console.log('SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('Provider:', process.env.WHATSAPP_PROVIDER);
"
```

---

## 📞 Support

- **Twilio Console** : https://console.twilio.com
- **Statut Twilio** : https://status.twilio.com
- **Docs WhatsApp** : https://www.twilio.com/docs/whatsapp

---

## ✅ Checklist développement

- [ ] Template créé dans `whatsapp-templates-twilio.ts`
- [ ] Catégorie ajoutée dans `templateCategories`
- [ ] Variables définies dans l'interface
- [ ] Preview fonctionne
- [ ] Test d'envoi réussi
- [ ] Documentation mise à jour

---

**Votre système est prêt !** Les clients peuvent maintenant recevoir des messages WhatsApp professionnels et personnalisés. 🎉