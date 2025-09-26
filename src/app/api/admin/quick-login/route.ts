import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  try {
    // Vérifier que la requête vient d'un admin
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (authorization) {
      const token = authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-1234567890') as any;
        const adminUser = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });
        
        if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'admin')) {
          return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }
    }
    
    const { email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const token = generateToken(user.id, user.role);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur quick login:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}