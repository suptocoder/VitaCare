/*
  Warnings:

  - A unique constraint covering the columns `[patientuuid]` on the table `PatientProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "patientuuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_patientuuid_key" ON "PatientProfile"("patientuuid");
