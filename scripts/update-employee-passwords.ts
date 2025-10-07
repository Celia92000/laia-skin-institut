// Script pour définir des mots de passe en clair pour les employés existants
import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function updateEmployeePasswords() {
  console.log('🔐 Mise à jour des mots de passe des employés...\n');

  // Récupérer tous les employés et admins
  const employees = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'EMPLOYEE' },
        { role: 'ADMIN' },
        { role: 'admin' }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plainPassword: true
    }
  });

  console.log(`Trouvé ${employees.length} employés/admins\n`);

  // Mots de passe par défaut pour les comptes existants
  const defaultPasswords: { [key: string]: string } = {
    'contact@laiaskininstitut.fr': 'Admin@2024!',
    'celia@laiaskin.com': 'Admin@2024!',
    'celia.ivorra95@hotmail.fr': 'Admin@2024!',
    'admin@laiaskininstitut.fr': 'Admin@2024!',
    'sophie.martin@laiaskin.fr': 'Sophie123!',
    'emma.dubois@laiaskin.fr': 'Emma123!',
    'lucas.petit@laiaskin.fr': 'Lucas123!',
    'marie.bernard@laiaskin.fr': 'Marie123!',
    'thomas.robert@laiaskin.fr': 'Thomas123!',
    'julie.moreau@laiaskin.fr': 'Julie123!'
  };

  for (const employee of employees) {
    if (!employee.plainPassword) {
      const password = defaultPasswords[employee.email] || 'Employee123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: employee.id },
        data: {
          password: hashedPassword,
          plainPassword: password
        }
      });

      console.log(`✅ ${employee.name} (${employee.email}): ${password}`);
    } else {
      console.log(`⏭️  ${employee.name} a déjà un mot de passe en clair`);
    }
  }

  console.log('\n✨ Mise à jour terminée !');
  await prisma.$disconnect();
}

updateEmployeePasswords().catch(console.error);