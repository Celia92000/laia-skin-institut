# 🌟 GUIDE COMPLET - LAIA SKIN INSTITUT

## 📊 État du Système

### ✅ Fonctionnalités Opérationnelles

| Fonctionnalité | État | Configuration |
|----------------|------|---------------|
| 💻 **Site Web** | ✅ Actif | https://laia-skin-institut-as92.vercel.app |
| 📧 **Email (Resend)** | ✅ Vérifié | contact@laiaskininstitut.fr |
| 💬 **WhatsApp** | ⚡ Mode Direct | Liens wa.me (prêt pour Twilio/Meta) |
| 🗄️ **Base de données** | ✅ Connectée | PostgreSQL Supabase |
| 📅 **Réservations** | ✅ Actif | Système complet |
| 👥 **CRM Clients** | ✅ Actif | Gestion complète |
| 📈 **Analytics** | ✅ Actif | Dashboard complet |
| 🎨 **Blog** | ✅ Actif | Articles + SEO |
| 🔐 **Authentification** | ✅ Actif | JWT sécurisé |

---

## 🚀 Démarrage Rapide

### 1️⃣ Lancer le site en local

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs
PORT=3001 npm run dev
```

**Accès** : http://localhost:3001

### 2️⃣ Identifiants Admin

- **Email** : admin@laiaskin.com
- **Mot de passe** : admin123

---

## 📧 Système Email (100% Opérationnel)

### Configuration Actuelle
- **Provider** : Resend
- **Domaine vérifié** : laiaskininstitut.fr ✅
- **Email pro** : contact@laiaskininstitut.fr
- **Templates** : 7 modèles prêts

### Templates Disponibles
1. **Bienvenue** - Nouveau client
2. **Rappel RDV** - 24h avant
3. **Promotion** - Offres spéciales
4. **Fidélité** - Programme de récompenses
5. **Anniversaire** - -25% offert
6. **Réactivation** - Clients inactifs
7. **Demande d'avis** - Après service

### Automatisations Email (Vercel Cron)

| Automatisation | Fréquence | État |
|----------------|-----------|------|
| Rappel RDV 24h | Toutes les heures | ✅ Configuré |
| Email anniversaire | 9h chaque jour | ✅ Configuré |
| Demande d'avis | 18h chaque jour | ✅ Configuré |

---

## 💬 Système WhatsApp

### État Actuel
- **Mode** : Direct (génère des liens wa.me)
- **Interface** : Complète et fonctionnelle
- **Templates** : 7 modèles prêts

### Pour Activer l'Envoi Automatique

#### Option 1 : Twilio (Recommandé - 30 min)
1. Créer compte sur twilio.com
2. Activer WhatsApp Sandbox
3. Dans `.env.local`, décommenter :
   ```env
   TWILIO_ACCOUNT_SID="ACxxxxx"
   TWILIO_AUTH_TOKEN="xxxxx"
   TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
   WHATSAPP_PROVIDER="twilio"
   ```

#### Option 2 : Meta Business API (2-3 jours)
1. Créer app sur developers.facebook.com
2. Configurer WhatsApp Business
3. Dans `.env.local`, décommenter :
   ```env
   WHATSAPP_ACCESS_TOKEN="EAAxxxxx"
   WHATSAPP_PHONE_NUMBER_ID="110xxxxx"
   WHATSAPP_PROVIDER="meta"
   ```

---

## 📁 Structure du Projet

```
laia-skin-nextjs/
├── src/
│   ├── app/           # Pages et API routes
│   ├── components/    # Composants React
│   ├── lib/          # Utilitaires et configurations
│   └── styles/       # Styles CSS/Tailwind
├── prisma/           # Schéma base de données
├── public/           # Assets publics
└── .env.local        # Variables d'environnement
```

---

## 🔧 Variables d'Environnement

```env
# Base de données (Supabase)
DATABASE_URL="postgresql://..."

# Email (Resend)
RESEND_API_KEY="re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR"
RESEND_FROM_EMAIL="LAIA SKIN Institut <contact@laiaskininstitut.fr>"

# Application
NEXT_PUBLIC_APP_URL="https://laia-skin-institut-as92.vercel.app"
JWT_SECRET="votre-secret-super-secure-ici"

# WhatsApp (à configurer)
WHATSAPP_PROVIDER="direct"
```

---

## 📊 Base de Données

### Tables Principales
- **User** : Clients et admin
- **Service** : Services proposés
- **Reservation** : Réservations
- **BlogPost** : Articles de blog
- **Review** : Avis clients
- **Promotion** : Offres spéciales
- **LoyaltyCard** : Programme fidélité
- **EmailHistory** : Historique emails

### Commandes Utiles

```bash
# Voir l'état de la base
npx prisma studio

# Mettre à jour le schéma
npx prisma db push

# Réinitialiser avec données test
npx prisma db seed
```

---

## 🎨 Interfaces Disponibles

### Espace Client
- `/` : Page d'accueil
- `/services` : Catalogue services
- `/reservation` : Prise de RDV
- `/blog` : Articles beauté
- `/login` : Connexion

### Espace Admin
- `/admin` : Dashboard
- `/admin/reservations` : Gestion RDV
- `/admin/clients` : CRM clients
- `/admin/services` : Gestion services
- `/admin/blog` : Gestion blog
- `/admin/marketing` : Email & WhatsApp
- `/admin/analytics` : Statistiques

---

## 📝 Scripts de Test

### Tester les Emails
```bash
npx tsx test-domaine-verifie.ts
```

### Tester WhatsApp
```bash
npx tsx test-whatsapp.ts
```

### Vérifier les Stats
```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const stats = {
    services: await prisma.service.count(),
    blogPosts: await prisma.blogPost.count({ where: { published: true }}),
    users: await prisma.user.count(),
    reservations: await prisma.reservation.count()
  };
  console.log('📊 Stats:', stats);
  await prisma.$disconnect();
})();
"
```

---

## 🚨 Dépannage

### Le site ne démarre pas
```bash
# Vérifier les dépendances
npm install

# Nettoyer le cache
rm -rf .next
npm run dev
```

### Erreur base de données
```bash
# Régénérer le client Prisma
npx prisma generate

# Pousser le schéma
npx prisma db push
```

### Email non envoyé
- Vérifier RESEND_API_KEY dans `.env.local`
- Vérifier que le domaine est vérifié dans Resend

---

## 📱 Support & Contact

### Documentation
- **Email** : `AUTOMATISATIONS_EMAIL.md`
- **WhatsApp** : `CONFIGURATION_WHATSAPP.md`
- **DNS** : `force-resend-check.md`

### Aide Externe
- **Resend** : https://resend.com/docs
- **Twilio** : https://www.twilio.com/docs/whatsapp
- **Vercel** : https://vercel.com/docs
- **Supabase** : https://supabase.com/docs

---

## ✨ Prochaines Étapes Recommandées

1. **Configurer WhatsApp** avec Twilio (30 min)
2. **Personnaliser les templates** d'email
3. **Ajouter vos vrais services** et tarifs
4. **Publier des articles** de blog
5. **Configurer les heures** d'ouverture
6. **Importer vos clients** existants

---

## 🎯 Checklist de Production

- [x] Site déployé sur Vercel
- [x] Base de données configurée
- [x] Email professionnel vérifié
- [x] Templates email créés
- [x] Automatisations configurées
- [ ] WhatsApp Business activé
- [ ] Données réelles importées
- [ ] Analytics Google configuré
- [ ] Backup automatique configuré
- [ ] SSL et sécurité vérifiés

---

**💡 Astuce** : Gardez ce guide ouvert pendant que vous travaillez sur le site !

**📌 Version** : 1.0.0 - Septembre 2024