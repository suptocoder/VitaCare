/*
  Warnings:

  - You are about to drop the column `contact_number` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_contact_number_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "contact_number";
