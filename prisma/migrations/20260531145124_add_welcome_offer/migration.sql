-- CreateEnum
CREATE TYPE "WelcomeOfferStatus" AS ENUM ('SENT', 'USED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "welcomeOfferCode" TEXT,
ADD COLUMN     "welcomeOfferId" TEXT,
ADD COLUMN     "welcomeOfferValue" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "WelcomeOffer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "status" "WelcomeOfferStatus" NOT NULL DEFAULT 'SENT',
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WelcomeOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WelcomeOffer_email_key" ON "WelcomeOffer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WelcomeOffer_code_key" ON "WelcomeOffer"("code");
