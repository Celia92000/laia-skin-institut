# 📋 Enregistrements DNS à ajouter chez Gandi

## ⚠️ Enregistrements manquants pour Resend

### 1. Enregistrement TXT pour la clé DKIM
```
Nom: resend._domainkey
Type: TXT
Valeur: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnIbiiV7JFTPMa/Zzw77ZBz9wT6i/B9evTr9Ze3ja+Ukp3IqKAgyAaSTHk5u5QGIyiC1aQ48CHyXdea4Wrb09RcmSRLK+XuGLZG/UpMUTwqUaEEEdK+k7s4b8zdL26rbvwiiIHMmOPARTQelxKujgideQrFj4QYpPc1H0F76R8NwIDAQAB
TTL: 10800
```

### 2. Enregistrement DMARC
```
Nom: _dmarc
Type: TXT
Valeur: v=DMARC1; p=none;
TTL: 10800
```

## 🔧 Comment ajouter ces enregistrements dans Gandi :

1. Connectez-vous à votre compte Gandi
2. Allez dans "Domaines" > "laiaskininstitut.fr"
3. Cliquez sur "Enregistrements DNS"
4. Pour chaque enregistrement :
   - Cliquez sur "Ajouter un enregistrement"
   - Sélectionnez le type (TXT)
   - Entrez le nom et la valeur
   - Laissez le TTL à 10800
   - Cliquez sur "Créer"

## ⚠️ Note importante :
Vous avez déjà un CNAME pour `resend._domainkey`. Il faudra peut-être :
1. Soit supprimer le CNAME existant et ajouter le TXT
2. Soit vérifier si Resend accepte la configuration actuelle

## ✅ Une fois ajoutés :
- Attendez 5-10 minutes pour la propagation DNS
- Retournez sur https://resend.com/domains
- Cliquez sur "Verify DNS records"