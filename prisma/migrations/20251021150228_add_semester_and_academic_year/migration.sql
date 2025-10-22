-- CreateTable
CREATE TABLE `teachers` (
    `id` VARCHAR(191) NOT NULL,
    `nip` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'FEMALE',
    `mobile` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `status` ENUM('TETAP', 'HONORER') NOT NULL DEFAULT 'TETAP',
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('GURU', 'KEPALA_SEKOLAH') NOT NULL DEFAULT 'GURU',
    `imageUrl` VARCHAR(191) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `teachers_id_key`(`id`),
    UNIQUE INDEX `teachers_nip_key`(`nip`),
    UNIQUE INDEX `teachers_mobile_key`(`mobile`),
    UNIQUE INDEX `teachers_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` VARCHAR(191) NOT NULL,
    `nis` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
    `birth_place` VARCHAR(191) NULL,
    `birth_date` DATETIME(3) NULL,
    `religion` ENUM('ISLAM', 'KATOLIK', 'PROTESTAN', 'HINDU', 'BUDHA', 'KONGHUCU', 'LAINNYA') NOT NULL,
    `address` VARCHAR(191) NULL,
    `father_name` VARCHAR(191) NULL,
    `mother_name` VARCHAR(191) NULL,
    `father_occupation` VARCHAR(191) NULL,
    `mother_occupation` VARCHAR(191) NULL,
    `child_order` INTEGER NULL,
    `imageUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `academic_year` VARCHAR(191) NOT NULL,
    `admitted_at` DATETIME(3) NULL,
    `classId` VARCHAR(191) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `students_id_key`(`id`),
    UNIQUE INDEX `students_nis_key`(`nis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `age_group` ENUM('GROUP_A', 'GROUP_B', 'TODDLER') NOT NULL DEFAULT 'GROUP_A',
    `teacherId` VARCHAR(191) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `classes_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `development_aspects` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 1,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `development_aspects_id_key`(`id`),
    UNIQUE INDEX `development_aspects_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `development_indicators` (
    `id` VARCHAR(191) NOT NULL,
    `aspectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `short_name` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 1,
    `age_group` ENUM('GROUP_A', 'GROUP_B', 'TODDLER') NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `development_indicators_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `development_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `indicatorId` VARCHAR(191) NOT NULL,
    `development` ENUM('BAIK', 'CUKUP', 'PERLU_DILATIH') NOT NULL DEFAULT 'BAIK',
    `notes` TEXT NULL,
    `assessment_date` DATETIME(3) NULL,
    `semester` INTEGER NOT NULL DEFAULT 1,
    `academic_year` VARCHAR(191) NOT NULL DEFAULT '2024/2025',
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `development_assessments_id_key`(`id`),
    INDEX `idx_dev_assessment_student`(`studentId`),
    INDEX `idx_dev_assessment_indicator`(`indicatorId`),
    INDEX `idx_dev_assessment_semester`(`semester`),
    UNIQUE INDEX `unique_student_indicator_semester_year`(`studentId`, `indicatorId`, `semester`, `academic_year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `physical_developments` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `height` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `head_circumference` DOUBLE NULL,
    `measurement_date` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `physical_developments_id_key`(`id`),
    UNIQUE INDEX `physical_developments_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_notes` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `note_type` ENUM('OBSERVATION', 'ACHIEVEMENT', 'BEHAVIOR', 'SOCIAL', 'EMOTIONAL', 'RECOMMENDATION', 'HEALTH') NOT NULL DEFAULT 'OBSERVATION',
    `title` VARCHAR(191) NULL,
    `content` VARCHAR(191) NOT NULL,
    `semester` INTEGER NOT NULL DEFAULT 1,
    `academic_year` VARCHAR(191) NOT NULL,
    `note_date` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `teacher_notes_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `development_indicators` ADD CONSTRAINT `development_indicators_aspectId_fkey` FOREIGN KEY (`aspectId`) REFERENCES `development_aspects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `development_assessments` ADD CONSTRAINT `dev_assessment_student_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `development_assessments` ADD CONSTRAINT `dev_assessment_indicator_fk` FOREIGN KEY (`indicatorId`) REFERENCES `development_indicators`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `physical_developments` ADD CONSTRAINT `physical_developments_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_notes` ADD CONSTRAINT `teacher_notes_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
