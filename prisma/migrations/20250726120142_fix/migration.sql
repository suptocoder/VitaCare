/*
  Warnings:

  - You are about to drop the column `ProfilePicURL` on the `PatientProfile` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "bloodgroup" ADD VALUE 'AB-';

-- AlterTable
ALTER TABLE "PatientProfile" DROP COLUMN "ProfilePicURL";
