-- AlterTable
ALTER TABLE "LoyaltyReward" ADD COLUMN     "selectedOption" TEXT;

-- AlterTable
ALTER TABLE "LoyaltyRewardRule" ADD COLUMN     "options" JSONB;
