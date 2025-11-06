/*
  Warnings:

  - You are about to drop the column `academic_year` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `academic_year`,
    ADD COLUMN `academic_year_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `development_assessments` ADD CONSTRAINT `dev_assessment_academic_year_fk` FOREIGN KEY (`academic_year`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
