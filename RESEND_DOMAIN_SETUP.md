# Configuration du domaine pour Resend

## 📧 Étapes pour vérifier votre domaine

### 1. Connectez-vous à Resend
- Allez sur https://resend.com/domains/3c49a278-9f93-4cb4-9f59-bf42648df2ee
- Connectez-vous avec vos identifiants

### 2. Enregistrements DNS à ajouter
Vous devez ajouter ces enregistrements DNS dans votre zone DNS (chez votre registrar ou hébergeur) :

#### SPF Record
```
Type: TXT
Name: @ (ou laisser vide)
Value: v=spf1 include:_spf.resend.com ~all
```

#### DKIM Records (3 enregistrements)
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.laiaskininstitut.fr.resend.email
```

```
Type: CNAME  
Name: resend2._domainkey
Value: resend2._domainkey.laiaskininstitut.fr.resend.email
```

```
Type: CNAME
Name: resend3._domainkey
Value: resend3._domainkey.laiaskininstitut.fr.resend.email
```

### 3. Où ajouter ces enregistrements ?

**Si votre domaine est chez :**
- **OVH** : Manager > Domaines > Zone DNS
- **Gandi** : Domaines > DNS Records
- **Namecheap** : Domain List > Manage > Advanced DNS
- **GoDaddy** : DNS > Manage DNS
- **Cloudflare** : DNS > Records

### 4. Vérifier dans Resend
- Retournez sur https://resend.com/domains
- Cliquez sur "Verify DNS Records"
- Attendez que le statut passe à "Verified" ✅

### 5. Activer dans le code
Une fois vérifié, décommentez dans `.env.local` :
```env
RESEND_FROM_EMAIL="LAIA SKIN Institut <contact@laiaskininstitut.fr>"
```

## ⏱️ Temps de propagation
- Les changements DNS peuvent prendre 5 minutes à 48h pour se propager
- Généralement c'est fait en 15-30 minutes

## 🔍 Vérifier que ça marche
Une fois configuré, testez avec ce script :

```bash
npx tsx -e "
import { Resend } from 'resend';
const resend = new Resend('re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR');
resend.emails.send({
  from: 'LAIA SKIN Institut <contact@laiaskininstitut.fr>',
  to: 'votre-email@gmail.com',
  subject: 'Test Resend',
  html: '<p>Email de test depuis votre domaine !</p>'
}).then(console.log).catch(console.error);
"
```

## ❓ Problèmes courants

### "Domain not verified"
- Vérifiez que tous les enregistrements DNS sont bien ajoutés
- Attendez la propagation DNS (jusqu'à 48h)
- Cliquez sur "Verify DNS Records" dans Resend

### "From address not allowed"
- Le domaine n'est pas encore vérifié
- L'adresse email dans FROM ne correspond pas au domaine vérifié

### Emails arrivent en spam
- Assurez-vous que le SPF est bien configuré
- Vérifiez que les 3 DKIM sont en place
- Évitez les mots spam dans vos sujets

## 📞 Support
Si vous avez des problèmes :
- Support Resend : support@resend.com
- Documentation : https://resend.com/docs