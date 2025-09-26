#!/bin/bash

# Fichiers à corriger
FILES=(
  "/home/celia/laia-github-temp/laia-skin-nextjs/src/app/api/admin/revenue-stats/route.ts"
  "/home/celia/laia-github-temp/laia-skin-nextjs/src/app/api/admin/real-stats/route.ts"
  "/home/celia/laia-github-temp/laia-skin-nextjs/src/app/api/admin/reservations/route.ts"
  "/home/celia/laia-github-temp/laia-skin-nextjs/src/lib/statistics.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Correction de $file..."
    
    # Remplacer l'import
    sed -i "s/import prisma from '@\/lib\/prisma'/import { getPrismaClient } from '@\/lib\/prisma'/g" "$file"
    sed -i "s/import { prisma } from '@\/lib\/prisma'/import { getPrismaClient } from '@\/lib\/prisma'/g" "$file"
    
    # Ajouter getPrismaClient au début des fonctions async
    # Chercher les patterns de requêtes Prisma et les corriger
    sed -i '/async function\|export async function\|const.*async.*=>/a\    const prisma = await getPrismaClient();' "$file"
    
    echo "✅ $file corrigé"
  fi
done

echo "Terminé !"