-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "customText" TEXT,
ADD COLUMN     "selectedColor" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableColors" JSONB,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "customizableText" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customizationPrice" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "unavailableColors" JSONB;
