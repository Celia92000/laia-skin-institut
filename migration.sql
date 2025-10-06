-- Migration pour ajouter les colonnes manquantes
-- À exécuter dans Supabase SQL Editor

-- Ajouter imageSettings aux services
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "imageSettings" TEXT;

-- Ajouter imageSettings aux formations
ALTER TABLE "Formation" ADD COLUMN IF NOT EXISTS "imageSettings" TEXT;

-- Ajouter les colonnes pour les avis sur commandes
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "itemType" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "itemId" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "itemName" TEXT;

-- Ajouter l'index unique sur orderId
CREATE UNIQUE INDEX IF NOT EXISTS "Review_orderId_key" ON "Review"("orderId");

-- Ajouter la foreign key pour orderId
ALTER TABLE "Review" ADD CONSTRAINT IF NOT EXISTS "Review_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ajouter orderId à l'historique de fidélité
ALTER TABLE "LoyaltyHistory" ADD COLUMN IF NOT EXISTS "orderId" TEXT;

-- Ajouter la relation reviews au modèle Order (déjà géré par Prisma via Review.orderId)
-- Pas besoin de modification sur Order car c'est une relation inverse

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Service' AND column_name = 'imageSettings';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Formation' AND column_name = 'imageSettings';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Review' AND column_name IN ('orderId', 'itemType', 'itemId', 'itemName');

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'LoyaltyHistory' AND column_name = 'orderId';
