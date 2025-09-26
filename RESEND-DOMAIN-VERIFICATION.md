# 📧 Configuration du Domaine LAIA SKIN dans Resend

## ⚠️ État actuel : FAILED

Votre domaine **laiaskininstitut.fr** est ajouté dans Resend mais la vérification a échoué.

## 🔧 Comment corriger cela :

### 1. Connectez-vous à Resend
- Allez sur : https://resend.com/domains
- Vous verrez votre domaine avec le statut "Failed"

### 2. Cliquez sur votre domaine pour voir les enregistrements DNS requis

Vous devez ajouter ces enregistrements DNS chez votre registraire de domaine (OVH, Gandi, etc.) :

### 3. Enregistrements DNS à ajouter :

#### A. Enregistrement SPF (TXT)
```
Type: TXT
Nom: @
Valeur: v=spf1 include:amazonses.com ~all
```

#### B. Enregistrement DKIM (CNAME)
Resend vous donnera 3 enregistrements CNAME comme :
```
Type: CNAME
Nom: resend._domainkey
Valeur: [valeur fournie par Resend]
```

#### C. Enregistrement de vérification (TXT)
```
Type: TXT
Nom: _resend
Valeur: [valeur fournie par Resend]
```

### 4. Où ajouter ces enregistrements ?

Selon votre hébergeur de domaine :

#### Si OVH :
1. Connectez-vous à votre espace client OVH
2. Allez dans "Domaines" > "laiaskininstitut.fr"
3. Onglet "Zone DNS"
4. Cliquez sur "Ajouter une entrée"
5. Ajoutez chaque enregistrement

#### Si Gandi :
1. Connectez-vous à Gandi
2. Allez dans "Domaines"
3. Cliquez sur "laiaskininstitut.fr"
4. Onglet "Enregistrements DNS"
5. Ajoutez les enregistrements

#### Si autre hébergeur :
Cherchez la section "DNS", "Zone DNS" ou "Enregistrements DNS"

### 5. Après avoir ajouté les enregistrements :

1. **Attendez 5-30 minutes** (propagation DNS)
2. Retournez sur https://resend.com/domains
3. Cliquez sur "Verify DNS records"
4. Le statut devrait passer à "Verified" ✅

## 📱 En attendant la vérification :

Pour l'instant, vos emails sont envoyés depuis **onboarding@resend.dev** et fonctionnent parfaitement !

Une fois le domaine vérifié, les emails viendront automatiquement de **contact@laiaskininstitut.fr**

## 🆘 Besoin d'aide ?

Si vous avez des difficultés :
1. Envoyez-moi une capture d'écran de votre interface DNS
2. Je vous guiderai étape par étape

## ✅ Test de vérification

Une fois les DNS configurés, testez avec :
```bash
npx tsx test-resend-email.ts
```

L'email devrait venir de contact@laiaskininstitut.fr au lieu de onboarding@resend.dev