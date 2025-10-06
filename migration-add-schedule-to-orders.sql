-- Migration pour ajouter les champs de planification aux commandes

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "scheduledDate" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "scheduledTime" TEXT;
