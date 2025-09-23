# 🔄 Forcer la vérification Resend

## Méthode 1 : Via l'interface Resend

1. Allez sur https://resend.com/domains
2. Cliquez sur votre domaine `laiaskininstitut.fr`
3. Cherchez un bouton :
   - "Retry verification"
   - "Re-verify"
   - "Check again"
   - "Verify DNS Records"
4. Cliquez dessus

## Méthode 2 : Recréer le domaine (si méthode 1 ne marche pas)

1. Dans Resend, cliquez sur votre domaine
2. Cliquez sur "Delete domain" ou l'icône poubelle
3. Confirmez la suppression
4. Cliquez sur "Add domain"
5. Entrez : `laiaskininstitut.fr`
6. Cliquez immédiatement sur "Verify DNS Records"

## Méthode 3 : API Resend directe

Testez si le domaine est utilisable même sans vérification complète :

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "LAIA SKIN <contact@laiaskininstitut.fr>",
    "to": "test@resend.dev",
    "subject": "Test vérification domaine",
    "html": "<p>Test</p>"
  }'
```

## Ce qui devrait être vérifié :

✅ SPF : `v=spf1 include:amazonses.com include:_spf.resend.com ~all`
✅ CNAME 1 : `resend._domainkey` → `resend._domainkey.laiaskininstitut.fr.resend.email`
✅ CNAME 2 : `resend2._domainkey` → `resend2._domainkey.laiaskininstitut.fr.resend.email`
✅ CNAME 3 : `resend3._domainkey` → `resend3._domainkey.laiaskininstitut.fr.resend.email`

## Si toujours bloqué après 24h :

Contactez Resend Support :
- Email : support@resend.com
- Objet : "Domain verification stuck - laiaskininstitut.fr"
- Mentionnez : 
  - Domain ID : 3c49a278-9f93-4cb4-9f59-bf42648df2ee
  - DNS configurés chez Gandi
  - SPF et CNAME correctement configurés