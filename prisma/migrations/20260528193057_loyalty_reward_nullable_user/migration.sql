-- DropForeignKey
ALTER TABLE "LoyaltyReward" DROP CONSTRAINT "LoyaltyReward_userId_fkey";

-- AlterTable
ALTER TABLE "LoyaltyReward" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LoyaltyReward" ADD CONSTRAINT "LoyaltyReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
