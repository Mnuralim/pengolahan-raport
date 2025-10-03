/*
  Warnings:

  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nip]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."AgeGroup" AS ENUM ('GROUP_A', 'GROUP_B', 'TODDLER');

-- CreateEnum
CREATE TYPE "public"."DevelopmentLevel" AS ENUM ('BB', 'MB', 'BSH', 'BSB');

-- CreateEnum
CREATE TYPE "public"."PAUDNoteType" AS ENUM ('OBSERVATION', 'ACHIEVEMENT', 'BEHAVIOR', 'SOCIAL', 'EMOTIONAL', 'RECOMMENDATION', 'HEALTH');

-- DropForeignKey
ALTER TABLE "public"."Score" DROP CONSTRAINT "Score_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Score" DROP CONSTRAINT "Score_studentId_fkey";

-- DropIndex
DROP INDEX "public"."classes_teacherId_key";

-- DropIndex
DROP INDEX "public"."students_classId_key";

-- AlterTable
ALTER TABLE "public"."classes" ADD COLUMN     "age_group" "public"."AgeGroup" NOT NULL DEFAULT 'GROUP_A';

-- AlterTable
ALTER TABLE "public"."students" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "birth_place" TEXT,
ADD COLUMN     "parent_name" TEXT,
ALTER COLUMN "nis" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."teachers" ADD COLUMN     "nip" TEXT,
ALTER COLUMN "gender" SET DEFAULT 'FEMALE';

-- DropTable
DROP TABLE "public"."Score";

-- CreateTable
CREATE TABLE "public"."development_aspects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "development_aspects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."development_indicators" (
    "id" TEXT NOT NULL,
    "aspectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "age_group" "public"."AgeGroup",
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "development_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."development_assessments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "development" "public"."DevelopmentLevel" NOT NULL DEFAULT 'MB',
    "notes" TEXT,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "academic_year" TEXT NOT NULL,
    "assessment_date" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "development_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."physical_developments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "head_circumference" DOUBLE PRECISION,
    "measurement_date" TIMESTAMP(3),
    "semester" INTEGER NOT NULL DEFAULT 1,
    "academic_year" TEXT NOT NULL,
    "health_notes" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_developments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher_notes" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "note_type" "public"."PAUDNoteType" NOT NULL DEFAULT 'OBSERVATION',
    "title" TEXT,
    "content" TEXT NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "academic_year" TEXT NOT NULL,
    "note_date" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "development_aspects_id_key" ON "public"."development_aspects"("id");

-- CreateIndex
CREATE UNIQUE INDEX "development_aspects_code_key" ON "public"."development_aspects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "development_indicators_id_key" ON "public"."development_indicators"("id");

-- CreateIndex
CREATE UNIQUE INDEX "development_assessments_id_key" ON "public"."development_assessments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "development_assessments_studentId_indicatorId_semester_acad_key" ON "public"."development_assessments"("studentId", "indicatorId", "semester", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "physical_developments_id_key" ON "public"."physical_developments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "physical_developments_studentId_semester_academic_year_key" ON "public"."physical_developments"("studentId", "semester", "academic_year");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_notes_id_key" ON "public"."teacher_notes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_nip_key" ON "public"."teachers"("nip");

-- AddForeignKey
ALTER TABLE "public"."development_indicators" ADD CONSTRAINT "development_indicators_aspectId_fkey" FOREIGN KEY ("aspectId") REFERENCES "public"."development_aspects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."development_assessments" ADD CONSTRAINT "development_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."development_assessments" ADD CONSTRAINT "development_assessments_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "public"."development_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."physical_developments" ADD CONSTRAINT "physical_developments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_notes" ADD CONSTRAINT "teacher_notes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
