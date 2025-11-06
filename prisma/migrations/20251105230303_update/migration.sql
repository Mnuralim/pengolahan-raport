/*
  Warnings:

  - You are about to drop the column `is_active` on the `academic_years` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `academic_years` DROP COLUMN `is_active`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;
