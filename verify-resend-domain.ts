#!/usr/bin/env npx tsx

import { Resend } from 'resend';

const RESEND_API_KEY = 're_Mksui53X_CFrkxKtg8YuViZhHmeZNSbmR';

async function verifyDomain() {
  const resend = new Resend(RESEND_API_KEY);
  
  try {
    // D'abord, listons les domaines pour obtenir l'ID
    console.log('📋 Récupération de la liste des domaines...\n');
    const { data: domains, error: listError } = await resend.domains.list();
    
    if (listError) {
      console.error('❌ Erreur lors de la récupération des domaines:', listError);
      return;
    }
    
    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      console.log('⚠️ Aucun domaine trouvé dans votre compte Resend');
      return;
    }
    
    // Afficher tous les domaines
    console.log('🌐 Domaines trouvés:');
    const domainsList = domains.data || domains;
    
    if (Array.isArray(domainsList)) {
      domainsList.forEach((domain: any) => {
        console.log(`\n📍 Domaine: ${domain.name}`);
        console.log(`   ID: ${domain.id}`);
        console.log(`   Status: ${domain.status}`);
        console.log(`   Région: ${domain.region}`);
        console.log(`   Créé: ${domain.created_at}`);
      });
    } else {
      console.log('Format de réponse inattendu:', domains);
    }
    
    // Trouver le domaine laiaskininstitut.fr
    const targetDomain = Array.isArray(domainsList) ? 
      domainsList.find((d: any) => 
        d.name === 'laiaskininstitut.fr' || 
        d.name.includes('laiaskininstitut')
      ) : null;
    
    if (!targetDomain) {
      console.log('\n⚠️ Domaine laiaskininstitut.fr non trouvé');
      return;
    }
    
    console.log(`\n✅ Domaine trouvé: ${targetDomain.name}`);
    console.log(`   ID: ${targetDomain.id}`);
    console.log(`   Status actuel: ${targetDomain.status}`);
    
    // Vérifier le domaine
    console.log('\n🔄 Lancement de la vérification DNS...');
    const { data: verified, error: verifyError } = await resend.domains.verify(targetDomain.id);
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }
    
    console.log('✅ Vérification lancée avec succès!');
    console.log('   ID de vérification:', verified?.id);
    
    // Attendre un peu et revérifier le status
    console.log('\n⏳ Attente de 5 secondes...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Récupérer le status mis à jour
    const { data: updatedDomains } = await resend.domains.list();
    const updatedDomainsList = updatedDomains?.data || updatedDomains;
    const updatedDomain = Array.isArray(updatedDomainsList) ? 
      updatedDomainsList.find((d: any) => d.id === targetDomain.id) : null;
    
    if (updatedDomain) {
      console.log('\n📊 Status mis à jour:');
      console.log(`   Domaine: ${updatedDomain.name}`);
      console.log(`   Status: ${updatedDomain.status}`);
      
      if (updatedDomain.status === 'verified') {
        console.log('\n🎉 Domaine vérifié avec succès!');
        console.log('   Vous pouvez maintenant envoyer des emails depuis contact@laiaskininstitut.fr');
      } else if (updatedDomain.status === 'pending') {
        console.log('\n⏳ Vérification toujours en cours...');
        console.log('   Les DNS peuvent prendre jusqu\'à 72h pour se propager');
        console.log('   Mais généralement c\'est fait en quelques minutes');
      } else {
        console.log('\n⚠️ Status inattendu:', updatedDomain.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer la vérification
console.log('🚀 Vérification du domaine Resend\n');
console.log('=' + '='.repeat(59));
verifyDomain();