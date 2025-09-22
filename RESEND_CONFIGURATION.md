# Configuration Resend pour l'envoi d'emails

## ⚠️ Problème actuel
Actuellement, Resend est en mode test avec 2 limitations :
1. **Expéditeur** : Les emails partent de `onboarding@resend.dev` au lieu de `contact@laia-skin.fr`
2. **Destinataires** : Ne peut envoyer qu'à votre adresse vérifiée : **celia.ivorra95@hotmail.fr**

Résultat : 
- Vos clients ne reçoivent pas leurs confirmations
- Les emails ne sont pas professionnels (mauvaise adresse d'envoi)

## 🔧 Solution : Configurer un domaine vérifié

### Étapes pour activer l'envoi à tous les clients :

1. **Connectez-vous à Resend**
   - Allez sur [app.resend.com](https://app.resend.com)
   - Connectez-vous avec vos identifiants

2. **Ajoutez votre domaine**
   - Cliquez sur "Domains" dans le menu
   - Cliquez sur "Add Domain"
   - Entrez votre domaine : `laiaskininstitut.fr` (ou votre domaine)

3. **Configurez les enregistrements DNS**
   Resend vous donnera des enregistrements DNS à ajouter. Généralement :
   - **SPF Record** : `TXT` record avec la valeur fournie
   - **DKIM Records** : Plusieurs `CNAME` records
   - **MX Record** (optionnel) : Pour recevoir des emails

4. **Vérifiez le domaine**
   - Une fois les DNS configurés, cliquez sur "Verify Domain"
   - La vérification peut prendre jusqu'à 48h

5. **Mettez à jour l'adresse d'envoi**
   Dans le fichier `.env.local`, décommentez la ligne :
   ```
   RESEND_FROM_EMAIL="LAIA SKIN INSTITUT <contact@laia-skin.fr>"
   ```
   (Enlevez le # au début de la ligne)

### 📝 Exemple de configuration DNS (chez votre hébergeur)

```
Type    Nom                    Valeur
TXT     @                      v=spf1 include:spf.resend.com ~all
CNAME   resend._domainkey      [valeur fournie par Resend]
CNAME   resend2._domainkey     [valeur fournie par Resend]
```

## 🚀 Une fois configuré

- ✅ **Les emails partiront de `contact@laia-skin.fr`** (professionnel)
- ✅ **Tous les clients recevront leurs confirmations** (plus de limitation)
- ✅ **Vous recevrez une copie sur `contact@laia-skin.fr`**
- ✅ **Meilleure délivrabilité** (moins de risque spam)
- ✅ **Image professionnelle** de votre institut

## 💡 Alternative temporaire

En attendant la configuration du domaine, vous pouvez :
1. Tester avec l'email autorisé : `celia.ivorra95@hotmail.fr`
2. Désactiver temporairement l'envoi d'emails dans le code
3. Utiliser uniquement les notifications WhatsApp

## 📞 Support

Si vous avez besoin d'aide :
- Documentation Resend : [resend.com/docs](https://resend.com/docs)
- Support Resend : support@resend.com