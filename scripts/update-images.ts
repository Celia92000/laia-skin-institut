import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
    }
  }
})

async function updateImages() {
  console.log('📸 Mise à jour des images des services...')
  
  const updates = [
    { slug: 'hydro-naissance', mainImage: '/services/hydro-naissance.jpg' },
    { slug: 'hydro-cleaning', mainImage: '/services/hydro-cleaning.jpg' },
    { slug: 'renaissance', mainImage: '/services/renaissance.jpg' },
    { slug: 'bb-glow', mainImage: '/services/bb-glow.jpg' },
    { slug: 'led-therapie', mainImage: '/services/led-therapie.jpg' }
  ]
  
  for (const update of updates) {
    try {
      await prisma.service.update({
        where: { slug: update.slug },
        data: { mainImage: update.mainImage }
      })
      console.log(`✅ Image mise à jour pour ${update.slug}`)
    } catch (error) {
      // Si le slug n'existe pas, on essaie par nom
      const service = await prisma.service.findFirst({
        where: { name: { contains: update.slug.replace('-', ' ') } }
      })
      if (service) {
        await prisma.service.update({
          where: { id: service.id },
          data: { mainImage: update.mainImage }
        })
        console.log(`✅ Image mise à jour pour ${service.name}`)
      }
    }
  }
  
  // Vérifier le résultat
  const services = await prisma.service.findMany({
    select: { name: true, mainImage: true }
  })
  
  console.log('\n📊 État des images :')
  services.forEach(s => {
    const status = s.mainImage ? '✅' : '❌'
    console.log(`  ${status} ${s.name}: ${s.mainImage || 'Pas d\'image'}`)
  })
  
  await prisma.$disconnect()
}

updateImages().catch(console.error)