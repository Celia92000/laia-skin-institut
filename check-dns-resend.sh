#!/bin/bash

echo "======================================"
echo "🔍 Diagnostic DNS pour laiaskininstitut.fr"
echo "======================================"
echo ""

DOMAIN="laiaskininstitut.fr"

echo "📌 Vérification des enregistrements TXT (SPF)"
echo "---------------------------------------------"
nslookup -type=txt $DOMAIN 8.8.8.8 | grep -A 5 "text ="

echo ""
echo "📌 Vérification DKIM Resend"
echo "---------------------------------------------"
nslookup -type=txt resend._domainkey.$DOMAIN 8.8.8.8 2>/dev/null | grep -A 5 "text ="
if [ $? -ne 0 ]; then
  echo "❌ Aucun enregistrement DKIM trouvé pour resend._domainkey"
fi

echo ""
echo "📌 Vérification DKIM SES (si existant)"
echo "---------------------------------------------"
for selector in s1 s2 s3 dkim; do
  result=$(nslookup -type=txt ${selector}._domainkey.$DOMAIN 8.8.8.8 2>/dev/null | grep "text =")
  if [ ! -z "$result" ]; then
    echo "✅ Trouvé: ${selector}._domainkey"
    echo "$result"
  fi
done

echo ""
echo "📌 Vérification des enregistrements MX"
echo "---------------------------------------------"
nslookup -type=mx $DOMAIN 8.8.8.8 | grep "mail exchanger"

echo ""
echo "======================================"
echo "📝 ANALYSE ET RECOMMANDATIONS"
echo "======================================"
echo ""

# Vérifier SPF
spf_record=$(nslookup -type=txt $DOMAIN 8.8.8.8 | grep "v=spf1")

if [[ $spf_record == *"amazonses.com"* ]] && [[ $spf_record != *"resend.com"* ]]; then
  echo "⚠️  PROBLÈME IDENTIFIÉ:"
  echo "   Votre SPF autorise Amazon SES mais pas Resend"
  echo ""
  echo "✅ SOLUTION:"
  echo "   Modifiez votre enregistrement SPF dans Gandi:"
  echo ""
  echo "   Type: TXT"
  echo "   Nom: @"
  echo "   Valeur: v=spf1 include:amazonses.com include:_spf.resend.com ~all"
  echo ""
elif [[ $spf_record == *"resend.com"* ]]; then
  echo "✅ SPF correctement configuré pour Resend"
else
  echo "⚠️  Aucun enregistrement SPF trouvé"
  echo "   Ajoutez dans Gandi:"
  echo ""
  echo "   Type: TXT"
  echo "   Nom: @"
  echo "   Valeur: v=spf1 include:_spf.resend.com ~all"
fi

echo ""
echo "📍 Pour ajouter DKIM Resend (si manquant):"
echo "   1. Allez sur https://resend.com/domains"
echo "   2. Cliquez sur votre domaine"
echo "   3. Copiez les valeurs DKIM fournies"
echo "   4. Ajoutez dans Gandi:"
echo "      Type: TXT"
echo "      Nom: resend._domainkey"
echo "      Valeur: [celle fournie par Resend]"
echo ""
echo "⏰ Après modification, attendez 5-10 minutes"
echo "   puis cliquez 'Verify' dans Resend"