# 📝 Enregistrements DNS à ajouter pour LAIA SKIN Institut

## Vous avez déjà ✅ :
```
_dmarc     TXT     v=DMARC1; p=none;     (Déjà configuré)
```

## Il vous manque probablement ces 3 enregistrements :

### 1️⃣ SPF Record (pour autoriser Resend à envoyer)
```
Type: TXT
Nom: @ (ou laisser vide selon votre interface)
Valeur: v=spf1 include:amazonses.com ~all
TTL: Auto
```

### 2️⃣ DKIM Records (pour l'authentification)
Resend vous donnera 3 enregistrements CNAME comme :
```
Type: CNAME
Nom: resend._domainkey.laiaskininstitut.fr
Valeur: [Une longue chaîne fournie par Resend]
TTL: Auto
```

```
Type: CNAME  
Nom: resend2._domainkey.laiaskininstitut.fr
Valeur: [Une longue chaîne fournie par Resend]
TTL: Auto
```

```
Type: CNAME
Nom: resend3._domainkey.laiaskininstitut.fr  
Valeur: [Une longue chaîne fournie par Resend]
TTL: Auto
```

### 3️⃣ Verification Record
```
Type: TXT
Nom: _resend.laiaskininstitut.fr
Valeur: [Code de vérification fourni par Resend]
TTL: Auto
```

## 🔍 Où trouver les valeurs exactes ?

1. Connectez-vous à Resend : https://resend.com
2. Allez dans "Domains"
3. Cliquez sur `laiaskininstitut.fr`
4. Vous verrez une section "DNS Records" avec les valeurs exactes à copier

## 💡 Astuce :
Sur Resend, il y a souvent un bouton "Copy" à côté de chaque enregistrement pour copier facilement la valeur exacte.

## ⚡ Une fois ajoutés :
1. Attendez 5-30 minutes
2. Retournez sur Resend
3. Cliquez "Verify DNS records"
4. Le statut passera de "Failed" à "Verified" ✅

Montrez-moi une capture d'écran de la page Resend avec les enregistrements demandés et je vous aiderai à les configurer correctement !