# Comment renouveler le token Meta WhatsApp

## ⚠️ Votre token Meta WhatsApp a expiré le 11 octobre 2025

Pour pouvoir envoyer des messages WhatsApp, vous devez renouveler votre token d'accès Meta.

## Étapes pour renouveler le token:

### 1. Connectez-vous à Facebook Developers
Allez sur: https://developers.facebook.com/apps/

### 2. Sélectionnez votre application
- Cliquez sur votre application WhatsApp Business
- ID de votre application: **1741901383229296**

### 3. Générez un nouveau token
1. Dans le menu de gauche, cliquez sur **"WhatsApp" > "Getting Started"** ou **"Configuration"**
2. Trouvez la section **"Temporary access token"** ou **"Jeton d'accès temporaire"**
3. Cliquez sur **"Generate Token"** ou **"Générer un jeton"**
4. Copiez le nouveau token généré (il commence par "EAA...")

### 4. Remplacez le token dans votre fichier .env.local
1. Ouvrez le fichier `.env.local` à la racine du projet
2. Trouvez la ligne `WHATSAPP_ACCESS_TOKEN="..."`
3. Remplacez l'ancien token par le nouveau
4. Sauvegardez le fichier

### 5. Redémarrez le serveur
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

## ℹ️ Informations importantes

- **Les tokens temporaires expirent après 24-60 jours**
- Pour un token permanent, vous devez:
  1. Créer un utilisateur système dans Meta Business Suite
  2. Générer un token d'accès permanent pour cet utilisateur
  3. Lui donner les permissions WhatsApp nécessaires

## 📞 Numéro de téléphone WhatsApp actuel
- **Phone Number ID**: 672520675954185
- **Numéro de test**: +1 555 622 3520

## ❓ Besoin d'aide?

Si vous rencontrez des difficultés:
1. Vérifiez que votre compte Meta Business est actif
2. Assurez-vous d'avoir les permissions nécessaires sur l'application
3. Consultez la documentation Meta: https://developers.facebook.com/docs/whatsapp/business-management-api/get-started
