#!/usr/bin/env python3
import os
import re

def fix_prisma_in_file(file_path):
    """Corrige l'utilisation de Prisma dans un fichier"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        original_content = content
        modified = False
        
        # 1. Remplacer l'import direct par getPrismaClient
        if "import prisma from '@/lib/prisma'" in content:
            content = content.replace(
                "import prisma from '@/lib/prisma'",
                "import { getPrismaClient } from '@/lib/prisma'"
            )
            modified = True
            
            # Ajouter const prisma = await getPrismaClient() dans les fonctions
            lines = content.split('\n')
            new_lines = []
            in_async_function = False
            added_prisma = False
            brace_count = 0
            
            for i, line in enumerate(lines):
                new_lines.append(line)
                
                # Détecter le début d'une fonction async
                if 'export async function' in line or 'export default async function' in line:
                    in_async_function = True
                    added_prisma = False
                    brace_count = 0
                
                # Compter les accolades
                if in_async_function:
                    brace_count += line.count('{') - line.count('}')
                    
                    # Ajouter après la première accolade ouvrante
                    if '{' in line and not added_prisma:
                        # Vérifier qu'on n'a pas déjà getPrismaClient
                        if i + 1 < len(lines) and 'getPrismaClient' not in lines[i + 1]:
                            new_lines.append('  const prisma = await getPrismaClient();')
                            added_prisma = True
                    
                    # Sortir de la fonction
                    if brace_count == 0 and added_prisma:
                        in_async_function = False
            
            content = '\n'.join(new_lines)
        
        # 2. Corriger les imports depuis @/lib/db
        if "from '@/lib/db'" in content:
            content = content.replace(
                "from '@/lib/db'",
                "from '@/lib/prisma'"
            )
            modified = True
        
        # Sauvegarder si modifié
        if modified and content != original_content:
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"✅ Corrigé: {file_path}")
            return True
        
        return False
    except Exception as e:
        print(f"❌ Erreur avec {file_path}: {e}")
        return False

# Trouver tous les fichiers TypeScript
print("🔍 Recherche de tous les fichiers TypeScript...")
all_files = []

for root, dirs, files in os.walk('src'):
    # Ignorer node_modules et .next
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
    
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            file_path = os.path.join(root, file)
            all_files.append(file_path)

print(f"📁 Trouvé {len(all_files)} fichiers TypeScript")
print("🔧 Correction des imports Prisma...")

fixed_count = 0
for file_path in all_files:
    if fix_prisma_in_file(file_path):
        fixed_count += 1

print(f"\n✨ Terminé! {fixed_count} fichiers corrigés au total.")