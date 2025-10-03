-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."TeacherStatus" AS ENUM ('TETAP', 'HONORER');

-- CreateTable
CREATE TABLE "public"."teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL DEFAULT 'MALE',
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "public"."TeacherStatus" NOT NULL DEFAULT 'TETAP',
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL DEFAULT 'MALE',
    "address" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Score" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "attendance_score" DOUBLE PRECISION NOT NULL,
    "skill_value" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "academic_year" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_id_key" ON "public"."teachers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_mobile_key" ON "public"."teachers"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_username_key" ON "public"."teachers"("username");

-- CreateIndex
CREATE UNIQUE INDEX "students_id_key" ON "public"."students"("id");

-- CreateIndex
CREATE UNIQUE INDEX "students_nis_key" ON "public"."students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "students_classId_key" ON "public"."students"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_id_key" ON "public"."classes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_teacherId_key" ON "public"."classes"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_id_key" ON "public"."Score"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Score_studentId_key" ON "public"."Score"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_classId_key" ON "public"."Score"("classId");

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Score" ADD CONSTRAINT "Score_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
