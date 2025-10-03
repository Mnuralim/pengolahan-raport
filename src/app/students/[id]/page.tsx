import { getStudent } from "@/actions/student";
import { StudentDetail } from "./_components/student-detail";
import { getAllDevelopmentIndicators } from "@/actions/development-aspect";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailStudentPage({ params }: Props) {
  const { id } = await params;
  const [student, indicatorsResult] = await Promise.all([
    getStudent(id),
    getAllDevelopmentIndicators(),
  ]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 px-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Data Siswa Tidak Ditemukan
        </h1>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 px-3 ">
      <StudentDetail indicators={indicatorsResult} student={student} />
    </div>
  );
}
