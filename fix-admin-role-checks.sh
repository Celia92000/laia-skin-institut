#!/bin/bash

echo "Correction des vérifications de rôle admin dans les API..."

# Trouver tous les fichiers route.ts dans le dossier admin
files=$(find src/app/api/admin -name "route.ts")

for file in $files; do
    echo "Traitement de $file"
    
    # Remplacer les vérifications de rôle strict
    sed -i "s/user\.role !== 'admin'/user.role !== 'admin' \&\& user.role !== 'ADMIN' \&\& user.role !== 'EMPLOYEE'/g" "$file"
    sed -i "s/user\.role === 'admin'/\(user.role === 'admin' || user.role === 'ADMIN' || user.role === 'EMPLOYEE'\)/g" "$file"
    
    # Cas spécial pour les vérifications avec !user
    sed -i "s/!user || user\.role !== 'admin'/!user || \(user.role !== 'admin' \&\& user.role !== 'ADMIN' \&\& user.role !== 'EMPLOYEE'\)/g" "$file"
done

echo "✅ Toutes les vérifications de rôle ont été mises à jour"