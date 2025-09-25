import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'laia-skin-secret-key-2024';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Login attempt:', { email, password });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json({ 
        error: 'Email ou mot de passe incorrect',
        debug: 'User not found'
      }, { status: 401 });
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);

    // Essayer les deux méthodes de comparaison
    const isValid10 = await bcrypt.compare(password, user.password);
    const isValid12 = await bcrypt.compare(password, user.password);
    
    console.log('Password validation (rounds 10):', isValid10);
    console.log('Password validation (rounds 12):', isValid12);
    
    // plainPassword removed for security

    if (!isValid10 && !isValid12) {
      console.log('❌ Password mismatch');
      return NextResponse.json({ 
        error: 'Email ou mot de passe incorrect',
        debug: 'Password mismatch'
      }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

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
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}