#!/bin/bash
# Script pour corriger tous les slugs de services

echo "🔧 Correction des slugs de services..."

# Remplacer 'hydro' par 'hydro-cleaning' (en évitant hydro-naissance)
find src -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  # Remplacer uniquement les occurrences isolées de 'hydro'
  sed -i 's/"hydro":/"hydro-cleaning":/g' "$file"
  sed -i "s/'hydro':/'hydro-cleaning':/g" "$file"
  sed -i 's/"hydro",/"hydro-cleaning",/g' "$file"
  sed -i "s/'hydro',/'hydro-cleaning',/g" "$file"
  sed -i 's/\["hydro"\]/["hydro-cleaning"]/g' "$file"
  sed -i 's/id === "hydro"/id === "hydro-cleaning"/g' "$file"
  sed -i "s/id === 'hydro'/id === 'hydro-cleaning'/g" "$file"
  sed -i 's/id !== "hydro"/id !== "hydro-cleaning"/g' "$file"
  sed -i "s/id !== 'hydro'/id !== 'hydro-cleaning'/g" "$file"
done

# Remplacer 'bbglow' par 'bb-glow'
find src -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i 's/"bbglow"/"bb-glow"/g' "$file"
  sed -i "s/'bbglow'/'bb-glow'/g" "$file"
done

# Remplacer 'led' par 'led-therapie' (en évitant led-therapie déjà existant)
find src -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i 's/"led":/"led-therapie":/g' "$file"
  sed -i "s/'led':/'led-therapie':/g" "$file"
  sed -i 's/"led",/"led-therapie",/g' "$file"
  sed -i "s/'led',/'led-therapie',/g" "$file"
  sed -i 's/\["led"\]/["led-therapie"]/g' "$file"
  sed -i 's/id === "led"/id === "led-therapie"/g' "$file"
  sed -i "s/id === 'led'/id === 'led-therapie'/g" "$file"
done

echo "✅ Slugs corrigés !"