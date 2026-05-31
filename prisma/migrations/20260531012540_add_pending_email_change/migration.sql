-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingEmail" TEXT,
ADD COLUMN     "pendingEmailVerifyExpires" TIMESTAMP(3),
ADD COLUMN     "pendingEmailVerifyToken" TEXT;
