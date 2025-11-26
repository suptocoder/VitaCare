/*
  Warnings:

  - You are about to drop the column `isonBoarded` on the `PatientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contact_number]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `BloodGroup` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_number` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "bloodgroup" AS ENUM ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "PatientProfile" DROP COLUMN "isonBoarded",
ADD COLUMN     "BloodGroup" "bloodgroup" NOT NULL,
ADD COLUMN     "ProfilePicURL" TEXT,
ADD COLUMN     "emergency_contacts" JSONB,
ADD COLUMN     "profile_picture_url" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "passwordHash",
ADD COLUMN     "contact_number" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_contact_number_key" ON "User"("contact_number");
