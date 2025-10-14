# 🔒 Configuration Upstash Redis (Gratuit)

## C'est quoi Upstash ?

Un service **gratuit** pour limiter les requêtes et protéger ton site contre le spam et les attaques.

**Plan gratuit** : 10 000 requêtes par jour (largement suffisant !)

---

## 📝 Étapes de configuration (5 minutes)

### 1. Créer un compte Upstash

1. Va sur https://upstash.com
2. Clique sur **"Sign Up"** (gratuit)
3. Connecte-toi avec GitHub ou Google

### 2. Créer une base Redis

1. Dans le dashboard, clique sur **"Create Database"**
2. Choisis :
   - **Name** : `laia-skin-ratelimit` (ou n'importe quel nom)
   - **Region** : **Europe (Frankfurt)** (le plus proche de la France)
   - **Type** : **Regional** (gratuit)
3. Clique sur **"Create"**

### 3. Récupérer les clés d'API

1. Dans la page de ta base Redis, tu verras :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
2. Clique sur **"Copy"** pour chaque clé

### 4. Ajouter les clés dans `.env.local`

Ouvre ton fichier `.env.local` et ajoute :

```env
# Rate Limiting avec Upstash Redis (gratuit)
UPSTASH_REDIS_REST_URL=https://eu2-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important** : Remplace par tes vraies clés copiées depuis Upstash !

### 5. Redémarrer le serveur

```bash
# Arrête le serveur (Ctrl+C)
# Puis relance :
npm run dev
```

---

## ✅ Vérification

Si tout fonctionne, tu verras dans les logs :
- ✅ Pas de warning "Rate limiting désactivé"
- ✅ Le rate limiting fonctionne automatiquement

---

## 🛡️ Protection activée sur :

- **Login** : Max 5 tentatives par minute
- **Paiement Stripe** : Max 5 requêtes par minute
- Protection automatique contre le spam

---

## 💰 Coûts

- **Gratuit** : 10 000 requêtes/jour
- Si tu dépasses : **0.20$ pour 100 000 requêtes** (super peu cher)

Pour un site comme le tien, **tu resteras largement dans le plan gratuit** !

---

## ⚠️ Si tu ne configures pas Upstash

Pas de panique ! Le site fonctionne quand même :
- Le rate limiting sera **désactivé**
- Tu verras un warning dans les logs
- **Le site continue de fonctionner normalement**

Mais c'est **fortement recommandé** de l'activer pour protéger ton site.
