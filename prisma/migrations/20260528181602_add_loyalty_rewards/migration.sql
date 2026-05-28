-- CreateEnum
CREATE TYPE "LoyaltyRewardType" AS ENUM ('COUPON_EURO', 'PERCENT', 'PRODUCT_DISCOUNT', 'FREE_PRODUCT', 'GIFT');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED');

-- CreateTable
CREATE TABLE "LoyaltyReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "LoyaltyRewardType" NOT NULL,
    "value" DOUBLE PRECISION,
    "status" "RewardStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "LoyaltyReward_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoyaltyReward" ADD CONSTRAINT "LoyaltyReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
