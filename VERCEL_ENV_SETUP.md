# Configuration des variables d'environnement sur Vercel

## Variables requises

Allez dans **Settings → Environment Variables** sur votre projet Vercel et ajoutez :

### 1. Base de données (Supabase)

```
DATABASE_URL
```
Valeur : Votre URL de connexion Supabase avec pgbouncer
Format : `postgresql://postgres.PROJECT_ID:PASSWORD@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true`

```
DIRECT_URL
```  
Valeur : URL directe sans pgbouncer
Format : `postgresql://postgres.PROJECT_ID:PASSWORD@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`

### 2. Email (Resend)

```
RESEND_API_KEY
```
Valeur : Votre clé API Resend (commence par `re_`)

```
RESEND_FROM_EMAIL
```
Valeur : `LAIA SKIN Institut <contact@laiaskininstitut.fr>`

### 3. Sécurité

```
JWT_SECRET
```
Valeur : Générer avec `openssl rand -base64 32`

```
CRON_SECRET
```
Valeur : Un secret unique pour sécuriser les cron jobs

### 4. URL du site

```
NEXT_PUBLIC_BASE_URL
```
Valeur : `https://votre-domaine.vercel.app`

## Notes importantes

- ⚠️ Cochez "Production", "Preview" et "Development" pour chaque variable
- ⚠️ Redéployez après avoir ajouté les variables
- ⚠️ La DATABASE_URL doit inclure `?pgbouncer=true` pour Supabase
