import prisma from './src/lib/prisma';

async function updateUserNames() {
  try {
    // Mettre à jour le nom de l'admin
    const admin = await prisma.user.update({
      where: { email: 'admin@laiaskin.com' },
      data: { name: 'Laïa' }
    });
    console.log('✅ Admin mis à jour:', admin.name);
    
    // Mettre à jour le nom de Marie si nécessaire
    const marie = await prisma.user.findUnique({
      where: { email: 'marie.dupont@email.com' }
    });
    
    if (marie && marie.name !== 'Marie Dupont') {
      const updated = await prisma.user.update({
        where: { email: 'marie.dupont@email.com' },
        data: { name: 'Marie Dupont' }
      });
      console.log('✅ Marie mise à jour:', updated.name);
    } else {
      console.log('✅ Marie déjà OK:', marie?.name);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserNames();