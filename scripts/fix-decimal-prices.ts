import { getPrismaClient } from './src/lib/prisma';

async function fixDecimalPrices() {
  const prisma = await getPrismaClient();
  
  try {
    console.log("🔧 CORRECTION DES PRIX DÉCIMAUX");
    console.log("=" .repeat(80));
    
    // 1. Récupérer toutes les réservations avec des prix décimaux
    const allReservations = await prisma.reservation.findMany({
      select: {
        id: true,
        totalPrice: true,
        paymentAmount: true,
        services: true,
        packages: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log(`\n📊 Nombre total de réservations: ${allReservations.length}`);
    
    let reservationsWithDecimals = [];
    let paymentsWithDecimals = [];
    
    // Identifier les prix avec décimales
    for (const res of allReservations) {
      // Vérifier totalPrice
      if (res.totalPrice && !Number.isInteger(res.totalPrice)) {
        reservationsWithDecimals.push({
          id: res.id,
          client: res.user?.name || 'Inconnu',
          oldPrice: res.totalPrice,
          newPrice: Math.round(res.totalPrice),
          services: res.services
        });
      }
      
      // Vérifier paymentAmount
      if (res.paymentAmount && !Number.isInteger(res.paymentAmount)) {
        paymentsWithDecimals.push({
          id: res.id,
          client: res.user?.name || 'Inconnu',
          oldAmount: res.paymentAmount,
          newAmount: Math.round(res.paymentAmount)
        });
      }
    }
    
    console.log(`\n❌ Réservations avec prix décimaux: ${reservationsWithDecimals.length}`);
    console.log(`❌ Paiements avec montants décimaux: ${paymentsWithDecimals.length}`);
    
    // 2. Corriger les prix décimaux
    if (reservationsWithDecimals.length > 0) {
      console.log("\n🔄 CORRECTION DES PRIX DE RÉSERVATION:");
      console.log("-" .repeat(80));
      
      for (const res of reservationsWithDecimals) {
        console.log(`\n📝 ${res.client}:`);
        console.log(`   Services: ${res.services}`);
        console.log(`   Prix avant: ${res.oldPrice}€`);
        console.log(`   Prix corrigé: ${res.newPrice}€`);
        
        await prisma.reservation.update({
          where: { id: res.id },
          data: { totalPrice: res.newPrice }
        });
        
        console.log(`   ✅ Corrigé`);
      }
    }
    
    // 3. Corriger les montants de paiement décimaux
    if (paymentsWithDecimals.length > 0) {
      console.log("\n🔄 CORRECTION DES MONTANTS DE PAIEMENT:");
      console.log("-" .repeat(80));
      
      for (const payment of paymentsWithDecimals) {
        console.log(`\n💳 ${payment.client}:`);
        console.log(`   Montant avant: ${payment.oldAmount}€`);
        console.log(`   Montant corrigé: ${payment.newAmount}€`);
        
        await prisma.reservation.update({
          where: { id: payment.id },
          data: { paymentAmount: payment.newAmount }
        });
        
        console.log(`   ✅ Corrigé`);
      }
    }
    
    // 4. Vérifier les services dans la base pour s'assurer qu'ils ont des prix entiers
    const services = await prisma.service.findMany();
    
    console.log("\n📋 VÉRIFICATION DES PRIX DES SERVICES:");
    console.log("-" .repeat(80));
    
    let servicesWithDecimals = [];
    
    for (const service of services) {
      let needsUpdate = false;
      let updates: any = {};
      
      if (service.price && !Number.isInteger(service.price)) {
        console.log(`\n⚠️  Service: ${service.name}`);
        console.log(`   Prix avant: ${service.price}€`);
        updates.price = Math.round(service.price);
        console.log(`   Prix corrigé: ${updates.price}€`);
        needsUpdate = true;
      }
      
      if (service.promoPrice && !Number.isInteger(service.promoPrice)) {
        if (!needsUpdate) {
          console.log(`\n⚠️  Service: ${service.name}`);
        }
        console.log(`   Prix promo avant: ${service.promoPrice}€`);
        updates.promoPrice = Math.round(service.promoPrice);
        console.log(`   Prix promo corrigé: ${updates.promoPrice}€`);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await prisma.service.update({
          where: { id: service.id },
          data: updates
        });
        console.log(`   ✅ Service corrigé`);
        servicesWithDecimals.push(service.name);
      }
    }
    
    if (servicesWithDecimals.length === 0) {
      console.log("   ✅ Tous les services ont des prix entiers");
    }
    
    // 5. Définir les prix corrects pour chaque service
    const correctPrices: Record<string, { price: number, promoPrice?: number }> = {
      'hydro-naissance': { price: 80, promoPrice: 60 },
      'hydro-cleaning': { price: 120, promoPrice: 90 },
      'renaissance': { price: 100, promoPrice: 75 },
      'bb-glow': { price: 150, promoPrice: 120 },
      'led-therapie': { price: 50, promoPrice: 40 }
    };
    
    console.log("\n🎯 APPLICATION DES PRIX STANDARDS:");
    console.log("-" .repeat(80));
    
    for (const service of services) {
      const correctPrice = correctPrices[service.slug];
      if (correctPrice) {
        const needsUpdate = 
          service.price !== correctPrice.price || 
          (correctPrice.promoPrice && service.promoPrice !== correctPrice.promoPrice);
        
        if (needsUpdate) {
          console.log(`\n📝 ${service.name}:`);
          console.log(`   Prix actuel: ${service.price}€ (promo: ${service.promoPrice}€)`);
          console.log(`   Prix correct: ${correctPrice.price}€ (promo: ${correctPrice.promoPrice}€)`);
          
          await prisma.service.update({
            where: { id: service.id },
            data: {
              price: correctPrice.price,
              promoPrice: correctPrice.promoPrice || null
            }
          });
          
          console.log(`   ✅ Prix standardisé`);
        }
      }
    }
    
    // 6. Résumé final
    console.log("\n" + "=" .repeat(80));
    console.log("✅ CORRECTION TERMINÉE!");
    console.log(`   - ${reservationsWithDecimals.length} prix de réservation corrigés`);
    console.log(`   - ${paymentsWithDecimals.length} montants de paiement corrigés`);
    console.log(`   - ${servicesWithDecimals.length} services corrigés`);
    console.log("\n💡 Tous les prix sont maintenant des nombres entiers!");
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDecimalPrices();