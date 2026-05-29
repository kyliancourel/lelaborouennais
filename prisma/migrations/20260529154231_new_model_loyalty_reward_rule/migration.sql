-- CreateTable
CREATE TABLE "LoyaltyRewardRule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "pointsCost" INTEGER NOT NULL,
    "type" "LoyaltyRewardType" NOT NULL,
    "value" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyRewardRule_pkey" PRIMARY KEY ("id")
);
