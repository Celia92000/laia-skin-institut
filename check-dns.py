#!/usr/bin/env python3

import dns.resolver
import sys

def check_dns(domain, subdomain=""):
    full_domain = f"{subdomain}.{domain}" if subdomain else domain
    print(f"\n🔍 Vérification DNS pour: {full_domain}")
    print("=" * 60)
    
    # Vérifier TXT
    print(f"\n📝 Enregistrements TXT pour {full_domain}:")
    try:
        answers = dns.resolver.resolve(full_domain, 'TXT')
        for rdata in answers:
            print(f"  → {rdata.to_text()}")
    except dns.resolver.NXDOMAIN:
        print(f"  ❌ Le domaine {full_domain} n'existe pas")
    except dns.resolver.NoAnswer:
        print(f"  ⚠️ Aucun enregistrement TXT trouvé")
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
    
    # Vérifier MX
    print(f"\n📧 Enregistrements MX pour {full_domain}:")
    try:
        answers = dns.resolver.resolve(full_domain, 'MX')
        for rdata in answers:
            print(f"  → Priorité {rdata.preference}: {rdata.exchange}")
    except dns.resolver.NXDOMAIN:
        print(f"  ❌ Le domaine {full_domain} n'existe pas")
    except dns.resolver.NoAnswer:
        print(f"  ⚠️ Aucun enregistrement MX trouvé")
    except Exception as e:
        print(f"  ❌ Erreur: {e}")

if __name__ == "__main__":
    domain = "laiaskininstitut.fr"
    
    print("=" * 60)
    print("🌐 DIAGNOSTIC DNS COMPLET - laiaskininstitut.fr")
    print("=" * 60)
    
    # Vérifier le domaine principal
    check_dns(domain)
    
    # Vérifier le sous-domaine bounces
    check_dns(domain, "bounces")
    
    # Vérifier DKIM Resend
    print("\n🔐 Vérification DKIM Resend:")
    for selector in ["resend._domainkey", "resend2._domainkey", "resend3._domainkey"]:
        try:
            full_domain = f"{selector}.{domain}"
            answers = dns.resolver.resolve(full_domain, 'CNAME')
            for rdata in answers:
                print(f"  ✅ {selector}: {rdata.to_text()}")
        except:
            try:
                answers = dns.resolver.resolve(full_domain, 'TXT')
                for rdata in answers:
                    txt = rdata.to_text()
                    if len(txt) > 100:
                        txt = txt[:100] + "..."
                    print(f"  ✅ {selector}: {txt}")
            except Exception as e:
                print(f"  ❌ {selector}: Non trouvé")
    
    # Vérifier DMARC
    print("\n🛡️ Vérification DMARC:")
    try:
        answers = dns.resolver.resolve(f"_dmarc.{domain}", 'TXT')
        for rdata in answers:
            print(f"  ✅ {rdata.to_text()}")
    except:
        print(f"  ❌ Aucun enregistrement DMARC trouvé")
    
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ:")
    print("=" * 60)
    print("✅ = Configuré correctement")
    print("⚠️ = Attention requise")
    print("❌ = Problème détecté")