/*
  Warnings:

  - The values [BB,MB,BSH,BSB] on the enum `DevelopmentLevel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `academic_year` on the `development_assessments` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `development_assessments` table. All the data in the column will be lost.
  - You are about to drop the column `academic_year` on the `physical_developments` table. All the data in the column will be lost.
  - You are about to drop the column `health_notes` on the `physical_developments` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `physical_developments` table. All the data in the column will be lost.
  - You are about to drop the column `parent_name` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,indicatorId]` on the table `development_assessments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId]` on the table `physical_developments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `religion` to the `students` table without a default value. This is not possible if the table is not empty.
  - Made the column `nis` on table `students` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."Religion" AS ENUM ('ISLAM', 'KATOLIK', 'PROTESTAN', 'HINDU', 'BUDHA', 'KONGHUCU', 'LAINNYA');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."DevelopmentLevel_new" AS ENUM ('BAIK', 'CUKUP', 'PERLU_DILATIH');
ALTER TABLE "public"."development_assessments" ALTER COLUMN "development" DROP DEFAULT;
ALTER TABLE "public"."development_assessments" ALTER COLUMN "development" TYPE "public"."DevelopmentLevel_new" USING ("development"::text::"public"."DevelopmentLevel_new");
ALTER TYPE "public"."DevelopmentLevel" RENAME TO "DevelopmentLevel_old";
ALTER TYPE "public"."DevelopmentLevel_new" RENAME TO "DevelopmentLevel";
DROP TYPE "public"."DevelopmentLevel_old";
ALTER TABLE "public"."development_assessments" ALTER COLUMN "development" SET DEFAULT 'BAIK';
COMMIT;

-- DropIndex
DROP INDEX "public"."development_assessments_studentId_indicatorId_semester_acad_key";

-- DropIndex
DROP INDEX "public"."physical_developments_studentId_semester_academic_year_key";

-- AlterTable
ALTER TABLE "public"."development_assessments" DROP COLUMN "academic_year",
DROP COLUMN "semester",
ALTER COLUMN "development" SET DEFAULT 'BAIK';

-- AlterTable
ALTER TABLE "public"."physical_developments" DROP COLUMN "academic_year",
DROP COLUMN "health_notes",
DROP COLUMN "semester";

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "parent_name",
ADD COLUMN     "admitted_at" TIMESTAMP(3),
ADD COLUMN     "child_order" INTEGER,
ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "father_occupation" TEXT,
ADD COLUMN     "mother_name" TEXT,
ADD COLUMN     "mother_occupation" TEXT,
ADD COLUMN     "religion" "public"."Religion" NOT NULL,
ADD COLUMN     "status" TEXT,
ALTER COLUMN "nis" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "development_assessments_studentId_indicatorId_key" ON "public"."development_assessments"("studentId", "indicatorId");

-- CreateIndex
CREATE UNIQUE INDEX "physical_developments_studentId_key" ON "public"."physical_developments"("studentId");
