# Configuration Resend pour l'envoi d'emails

## ⚠️ Problème actuel
Actuellement, Resend est en mode test et ne peut envoyer des emails qu'à l'adresse vérifiée : **celia.ivorra95@hotmail.fr**

Si un client réserve avec une autre adresse email, il ne recevra pas de confirmation.

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
   Dans le fichier `.env.local`, changez :
   ```
   RESEND_FROM_EMAIL=contact@laiaskininstitut.fr
   ```

### 📝 Exemple de configuration DNS (chez votre hébergeur)

```
Type    Nom                    Valeur
TXT     @                      v=spf1 include:spf.resend.com ~all
CNAME   resend._domainkey      [valeur fournie par Resend]
CNAME   resend2._domainkey     [valeur fournie par Resend]
```

## 🚀 Une fois configuré

- ✅ Tous les clients recevront leurs confirmations de réservation
- ✅ Les emails partiront de `contact@laiaskininstitut.fr`
- ✅ Meilleure délivrabilité (moins de spam)
- ✅ Possibilité d'envoyer des campagnes marketing

## 💡 Alternative temporaire

En attendant la configuration du domaine, vous pouvez :
1. Tester avec l'email autorisé : `celia.ivorra95@hotmail.fr`
2. Désactiver temporairement l'envoi d'emails dans le code
3. Utiliser uniquement les notifications WhatsApp

## 📞 Support

Si vous avez besoin d'aide :
- Documentation Resend : [resend.com/docs](https://resend.com/docs)
- Support Resend : support@resend.com