/*
  Warnings:

  - You are about to alter the column `semester` on the `development_assessments` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Enum(EnumId(8))`.

*/
-- DropForeignKey
ALTER TABLE `development_assessments` DROP FOREIGN KEY `dev_assessment_student_fk`;

-- AlterTable
ALTER TABLE `development_assessments` MODIFY `semester` ENUM('SEMESTER_1', 'SEMESTER_2') NOT NULL DEFAULT 'SEMESTER_1',
    ALTER COLUMN `academic_year` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `idx_dev_assessment_academic_year` ON `development_assessments`(`academic_year`);

-- CreateIndex
CREATE INDEX `idx_student_period` ON `development_assessments`(`studentId`, `academic_year`, `semester`);

-- AddForeignKey
ALTER TABLE `development_assessments` ADD CONSTRAINT `dev_assessment_student_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
