-- DropForeignKey
ALTER TABLE `classes` DROP FOREIGN KEY `classes_teacherId_fkey`;

-- DropIndex
DROP INDEX `classes_teacherId_fkey` ON `classes`;

-- CreateTable
CREATE TABLE `class_teachers` (
    `id` VARCHAR(191) NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `teacher_id` VARCHAR(191) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `class_teachers_id_key`(`id`),
    INDEX `class_teachers_class_id_idx`(`class_id`),
    INDEX `class_teachers_teacher_id_idx`(`teacher_id`),
    UNIQUE INDEX `class_teachers_class_id_teacher_id_key`(`class_id`, `teacher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `class_teachers` ADD CONSTRAINT `class_teachers_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_teachers` ADD CONSTRAINT `class_teachers_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
