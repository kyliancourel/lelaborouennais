-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "rewardId" TEXT,
ADD COLUMN     "rewardSelectedOption" TEXT,
ADD COLUMN     "rewardTitle" TEXT,
ADD COLUMN     "rewardType" "LoyaltyRewardType",
ADD COLUMN     "rewardValue" DOUBLE PRECISION;
