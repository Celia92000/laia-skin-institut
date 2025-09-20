# 📧 Guide de configuration des emails avec Resend

## 🚀 Configuration rapide

### 1. Récupérer votre clé API Resend
1. Connectez-vous sur [https://resend.com/api-keys](https://resend.com/api-keys)
2. Copiez votre clé API (commence par `re_`)

### 2. Configuration sur Vercel

1. Allez sur [https://vercel.com/celia92000s-projects/laia-skin-institut-as92/settings/environment-variables](https://vercel.com/celia92000s-projects/laia-skin-institut-as92/settings/environment-variables)

2. Ajoutez ces variables d'environnement :

```
RESEND_API_KEY = votre_cle_api_resend
NEXT_PUBLIC_APP_URL = https://laia-skin-institut-as92.vercel.app
```

3. Cliquez sur "Save" pour chaque variable

4. **IMPORTANT** : Redéployez l'application
   - Allez dans l'onglet "Deployments"
   - Cliquez sur les 3 points du dernier déploiement
   - Sélectionnez "Redeploy"

### 3. Configuration locale (pour tests)

Modifiez le fichier `.env.local` :
```env
RESEND_API_KEY="votre_cle_api_resend"
NEXT_PUBLIC_APP_URL="https://laia-skin-institut-as92.vercel.app"
```

## ✉️ Fonctionnalités disponibles

### Emails envoyés automatiquement :
- **Mot de passe oublié** : Email avec lien de réinitialisation
- **Confirmation de réservation** : (à venir)
- **Rappel de rendez-vous** : (à venir)

## 🎨 Personnalisation

### Modifier l'adresse d'envoi

Par défaut, les emails sont envoyés depuis `onboarding@resend.dev`.

Pour utiliser votre propre domaine :
1. Vérifiez votre domaine dans Resend
2. Modifiez la ligne 120 dans `/src/lib/email-service.ts` :
```typescript
from: 'LAIA SKIN Institut <noreply@votredomaine.com>'
```

## 🧪 Test

Pour tester l'envoi d'emails :
1. Allez sur `/mot-passe-oublie`
2. Entrez votre email
3. Vérifiez votre boîte de réception

## ⚠️ Limites du plan gratuit Resend

- **100 emails par mois**
- **100 emails par jour**
- Idéal pour commencer !

## 🔧 Dépannage

### Les emails n'arrivent pas ?
1. Vérifiez vos spams
2. Vérifiez que la clé API est correcte sur Vercel
3. Vérifiez les logs dans Resend Dashboard

### Email "from" non vérifié ?
- Utilisez `onboarding@resend.dev` temporairement
- Ou vérifiez votre domaine dans Resend

## 📝 Notes

- Les liens de réinitialisation expirent après 1 heure
- Les emails ont un design professionnel responsive
- Compatible mobile et desktop