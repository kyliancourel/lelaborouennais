-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifyExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerifyToken" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
