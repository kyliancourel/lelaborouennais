-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "selectedColors" JSONB;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colorZones" JSONB;
