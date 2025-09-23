# 🔧 Résolution du problème de vérification Resend

## ❌ Si le statut est "Failed" ou "En échec"

### 1. Vérifier les enregistrements DNS actuels

Utilisez cet outil pour vérifier vos DNS actuels :
- https://mxtoolbox.com/SuperTool.aspx
- Ou dans le terminal : `nslookup -type=TXT laiaskininstitut.fr`

### 2. Points à vérifier

#### ✅ Checklist DNS

**Pour le SPF :**
- [ ] L'enregistrement TXT existe sur votre domaine racine
- [ ] Il contient exactement : `v=spf1 include:_spf.resend.com ~all`
- [ ] Pas d'espaces en trop ou caractères manquants

**Pour les DKIM (les 3) :**
- [ ] Les 3 enregistrements CNAME existent
- [ ] Les noms sont corrects : `resend._domainkey`, `resend2._domainkey`, `resend3._domainkey`
- [ ] Les valeurs pointent vers `.resend.email`

### 3. Erreurs courantes et solutions

#### ⚠️ "SPF record not found"
**Problème :** L'enregistrement TXT SPF n'est pas détecté
**Solution :**
```
Type: TXT
Host/Name: @ (ou laisser vide, ou mettre laiaskininstitut.fr)
Value: "v=spf1 include:_spf.resend.com ~all"
TTL: 3600 (ou Auto)
```

#### ⚠️ "DKIM records not found"
**Problème :** Un ou plusieurs CNAME DKIM manquent
**Solution :** Vérifiez que vous avez bien créé les 3 enregistrements CNAME

#### ⚠️ "Invalid CNAME target"
**Problème :** Les valeurs CNAME sont incorrectes
**Solution :** Copiez-collez exactement depuis Resend Dashboard

### 4. Solution alternative : Utiliser un sous-domaine

Si vous ne pouvez pas modifier les DNS du domaine principal, créez un sous-domaine :

1. **Créer un sous-domaine** : `mail.laiaskininstitut.fr`
2. **Ajouter ce sous-domaine dans Resend**
3. **Configurer les DNS du sous-domaine**
4. **Utiliser** : `contact@mail.laiaskininstitut.fr`

### 5. Vérifier avec ces commandes

```bash
# Vérifier SPF
dig TXT laiaskininstitut.fr

# Vérifier DKIM
dig CNAME resend._domainkey.laiaskininstitut.fr
dig CNAME resend2._domainkey.laiaskininstitut.fr  
dig CNAME resend3._domainkey.laiaskininstitut.fr
```

### 6. Si rien ne fonctionne : Solution temporaire

En attendant la résolution, vous pouvez utiliser l'email par défaut de Resend :

```javascript
// Dans /src/app/api/email/send-campaign/route.ts
from: 'onboarding@resend.dev', // Email par défaut Resend
```

Ou créer un fichier de configuration :

```typescript
// /src/lib/email-config.ts
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || 'LAIA SKIN Institut <onboarding@resend.dev>';
```

### 7. Contacter votre hébergeur

Si vous n'avez pas accès aux DNS, demandez à votre hébergeur d'ajouter :

**Email à envoyer à votre hébergeur :**
```
Bonjour,

Je souhaite configurer l'envoi d'emails transactionnels via Resend pour mon domaine laiaskininstitut.fr.

Pourriez-vous ajouter les enregistrements DNS suivants :

1. Enregistrement TXT sur @ :
   v=spf1 include:_spf.resend.com ~all

2. Enregistrement CNAME :
   Nom: resend._domainkey
   Valeur: resend._domainkey.laiaskininstitut.fr.resend.email

3. Enregistrement CNAME :
   Nom: resend2._domainkey  
   Valeur: resend2._domainkey.laiaskininstitut.fr.resend.email

4. Enregistrement CNAME :
   Nom: resend3._domainkey
   Valeur: resend3._domainkey.laiaskininstitut.fr.resend.email

Merci d'avance.
```

### 8. Plan B : Autres services email

Si Resend ne fonctionne pas, voici des alternatives :

- **SendGrid** : https://sendgrid.com (25 000 emails/mois gratuits)
- **Mailgun** : https://mailgun.com (5 000 emails/mois gratuits)
- **Brevo (ex-Sendinblue)** : https://brevo.com (300 emails/jour gratuits)
- **EmailJS** : Déjà configuré dans votre projet comme backup

## 🚀 Une fois résolu

1. Retournez sur https://resend.com/domains
2. Cliquez sur "Verify DNS Records"
3. Le statut devrait passer à "Verified" ✅
4. Décommentez dans `.env.local` :
   ```
   RESEND_FROM_EMAIL="LAIA SKIN Institut <contact@laiaskininstitut.fr>"
   ```

## 💡 Astuce

Pendant que vous attendez la vérification, vous pouvez tester l'envoi avec :

```bash
npx tsx test-resend-api.ts
```

Cela utilisera l'email par défaut de Resend et confirmera que l'API fonctionne.