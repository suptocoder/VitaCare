/*
  Warnings:

  - A unique constraint covering the columns `[contact_number]` on the table `PatientProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_contact_number_key" ON "PatientProfile"("contact_number");
