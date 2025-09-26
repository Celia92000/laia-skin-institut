#!/usr/bin/env python3
import os
import re

def fix_prisma_import(file_path):
    """Corrige les imports Prisma dans un fichier"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Remplacer l'import direct par getPrismaClient
        original_content = content
        content = content.replace(
            "import prisma from '@/lib/prisma'",
            "import { getPrismaClient } from '@/lib/prisma'"
        )
        
        # Si le fichier a été modifié, ajouter const prisma = await getPrismaClient()
        if content != original_content:
            # Trouver toutes les fonctions async export
            pattern = r'(export async function \w+[^{]*\{)'
            
            def add_prisma_init(match):
                func_start = match.group(1)
                # Vérifier si c'est déjà ajouté
                if 'getPrismaClient' in content[match.end():match.end()+100]:
                    return func_start
                return func_start + '\n  const prisma = await getPrismaClient();'
            
            content = re.sub(pattern, add_prisma_init, content)
            
            # Écrire le fichier modifié
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"✅ Corrigé: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"❌ Erreur avec {file_path}: {e}")
        return False

# Liste des fichiers à corriger
files = [
    "src/app/api/admin/dashboard/route.ts",
    "src/app/api/admin/statistics/route.ts",
    "src/app/api/admin/clients/route.ts",
    "src/app/api/admin/services/route.ts",
    "src/app/api/admin/services/[id]/route.ts",
    "src/app/api/admin/products/route.ts",
    "src/app/api/admin/products/[id]/route.ts",
    "src/app/api/admin/users/route.ts",
    "src/app/api/admin/loyalty/route.ts",
    "src/app/api/admin/validate-reservation/route.ts",
    "src/app/api/services/route.ts",
    "src/app/api/services/[slug]/route.ts",
    "src/app/api/reservations/route.ts",
    "src/app/api/availability/route.ts",
    "src/app/api/auth/verify/route.ts",
    "src/app/api/auth/refresh/route.ts",
    "src/app/api/auth/reset-password/route.ts",
    "src/app/api/auth/forgot-password/route.ts",
    "src/app/api/user/profile/route.ts",
    "src/app/api/user/preferences/route.ts",
    "src/app/api/user/change-password/route.ts",
]

print("🔧 Correction des imports Prisma dans les fichiers critiques...")
fixed_count = 0

for file_path in files:
    if os.path.exists(file_path):
        if fix_prisma_import(file_path):
            fixed_count += 1

print(f"\n✨ Terminé! {fixed_count} fichiers corrigés.")