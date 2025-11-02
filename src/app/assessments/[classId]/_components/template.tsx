import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as NextImage,
} from "@react-pdf/renderer";
import type { StudentWithAssessments } from "@/app/students/[id]/_components/student-detail";
import { formatDate } from "@/lib/utils";

interface PAUDReportPDFProps {
  student: StudentWithAssessments;
  semester: number;
  academicYear: string;
  schoolInfo: {
    name: string;
    address: string;
    city: string;
    province: string;
    phone: string;
    email: string;
    headName?: string;
    headNIP?: string;
    teacherName?: string;
  };
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },
  headerWithLogo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: "bold",
  },
  schoolInfo: {
    fontSize: 9,
    marginBottom: 2,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  semesterInfo: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 15,
  },
  studentBasicInfo: {
    flexDirection: "row",
    marginBottom: 20,
    fontSize: 10,
  },
  studentInfoLeft: {
    width: "50%",
  },
  studentInfoRight: {
    width: "50%",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  infoLabel: {
    width: "40%",
  },
  infoValue: {
    width: "60%",
  },
  identitySection: {
    marginBottom: 20,
  },
  identityTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  identityRow: {
    flexDirection: "row",
    marginBottom: 2,
    fontSize: 9,
  },
  identityNumber: {
    width: "5%",
    textAlign: "right",
    paddingRight: 5,
  },
  identityLabel: {
    width: "45%",
  },
  identityValue: {
    width: "50%",
  },
  assessmentSection: {
    marginBottom: 20,
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
  },
  tableSubHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
  },
  tableHeaderCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableHeaderNo: {
    width: "5%",
  },
  tableHeaderAspect: {
    width: "70%",
  },
  tableHeaderResult: {
    width: "25%",
  },
  tableHeaderBaik: {
    width: "8.33%",
  },
  tableHeaderCukup: {
    width: "8.33%",
  },
  tableHeaderPerluDialatih: {
    width: "8.34%",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    padding: 3,
    fontSize: 8,
    minHeight: 20,
    justifyContent: "center",
  },
  tableCellNo: {
    width: "5%",
    textAlign: "center",
    fontWeight: "bold",
  },
  tableCellAspect: {
    width: "70%",
    paddingLeft: 4,
  },
  tableCellIndicator: {
    width: "70%",
    paddingLeft: 20,
  },
  tableCellBaik: {
    width: "8.33%",
    textAlign: "center",
  },
  tableCellCukup: {
    width: "8.33%",
    textAlign: "center",
  },
  tableCellPerluDialatih: {
    width: "8.34%",
    textAlign: "center",
  },
  aspectRow: {
    backgroundColor: "#ffffff",
  },
  indicatorRow: {
    backgroundColor: "#ffffff",
  },
  checkmark: {
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "flex-end",
    fontSize: 9,
  },
  signatureBox: {
    width: "30%",
    textAlign: "center",
  },
  signatureDate: {
    marginBottom: 5,
  },
  signatureTitle: {
    marginBottom: 40,
  },
  signatureName: {
    fontWeight: "bold",
  },
  signatureNIP: {
    fontSize: 8,
  },
});

const getRomanNumeral = (num: number): string => {
  const romanNumerals = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
  ];
  return romanNumerals[num - 1] || num.toString();
};

const groupAssessmentsByAspect = (
  assessments: StudentWithAssessments["developmentAssessments"]
) => {
  const grouped: Record<
    string,
    Array<{
      indicator: string;
      development: "BAIK" | "CUKUP" | "PERLU_DILATIH";
      notes?: string;
    }>
  > = {};

  assessments.forEach((assessment) => {
    const aspectName = assessment.indicator.aspect.name;
    if (!grouped[aspectName]) {
      grouped[aspectName] = [];
    }
    grouped[aspectName].push({
      indicator: assessment.indicator.name,
      development: assessment.development,
      notes: assessment.notes || "",
    });
  });

  return grouped;
};

export const PAUDReportPDF: React.FC<PAUDReportPDFProps> = ({
  student,
  semester,
  academicYear,
  schoolInfo,
}) => {
  const groupedAssessments = groupAssessmentsByAspect(
    student.developmentAssessments
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerWithLogo}>
            <NextImage style={styles.logo} src="/logo.png" />
            <View style={styles.headerText}>
              <Text style={styles.title}>TAMAN KANAK-KANAK WAKEA-KEA</Text>
              <Text style={styles.subtitle}>TK WAKEA-KEA</Text>
            </View>
          </View>
          <Text style={styles.schoolInfo}>{schoolInfo.address}</Text>
          <Text style={styles.schoolInfo}>
            {schoolInfo.city}, {schoolInfo.province}
          </Text>
          <Text style={styles.schoolInfo}>Email: {schoolInfo.email}</Text>

          <Text style={styles.reportTitle}>
            PERKEMBANGAN ANAK DIDIK USIA 4 - 5 TAHUN
          </Text>
          <Text style={styles.semesterInfo}>
            SEMESTER {semester} TAHUN PELAJARAN {academicYear}
          </Text>
        </View>

        <View style={styles.identitySection}>
          <Text style={styles.identityTitle}>IDENTITAS PESERTA DIDIK</Text>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>1.</Text>
            <Text style={styles.identityLabel}>Nama Lengkap</Text>
            <Text style={styles.identityValue}>: {student.name}</Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>2.</Text>
            <Text style={styles.identityLabel}>NIS / NISN</Text>
            <Text style={styles.identityValue}>: {student.nis}</Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>3.</Text>
            <Text style={styles.identityLabel}>Jenis Kelamin</Text>
            <Text style={styles.identityValue}>
              : {student.gender === "MALE" ? "Laki-laki" : "Perempuan"}
            </Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>4.</Text>
            <Text style={styles.identityLabel}>Tempat dan Tanggal Lahir</Text>
            <Text style={styles.identityValue}>
              : {student.birthPlace || "-"},{" "}
              {formatDate(student.birthDate || new Date())}
            </Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>5.</Text>
            <Text style={styles.identityLabel}>Agama</Text>
            <Text style={styles.identityValue}>: {student.religion}</Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>6.</Text>
            <Text style={styles.identityLabel}>Berat Badan</Text>
            <Text style={styles.identityValue}>
              : {student.physicalDevelopments?.weight || "-"} Kg
            </Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>7.</Text>
            <Text style={styles.identityLabel}>Tinggi Badan</Text>
            <Text style={styles.identityValue}>
              : {student.physicalDevelopments?.height || "-"} Cm
            </Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>8.</Text>
            <Text style={styles.identityLabel}>Lingkar Kepala</Text>
            <Text style={styles.identityValue}>
              : {student.physicalDevelopments?.headCircumference || "-"} Cm
            </Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>9.</Text>
            <Text style={styles.identityLabel}>Anak ke</Text>
            <Text style={styles.identityValue}>
              : {student.childOrder ? `Ketiga (${student.childOrder})` : "-"}
            </Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>10.</Text>
            <Text style={styles.identityLabel}>Status dalam keluarga</Text>
            <Text style={styles.identityValue}>: Anak kandung</Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>11.</Text>
            <Text style={styles.identityLabel}>Alamat</Text>
            <Text style={styles.identityValue}>: {student.address || "-"}</Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>12.</Text>
            <Text style={styles.identityLabel}>Diterima di PAUD ini</Text>
            <View style={styles.identityValue}>
              <View style={styles.identityRow}>
                <Text style={{ width: "30%" }}>a. Kelompok</Text>
                <Text>: {student.class.ageGroup}</Text>
              </View>
              <View style={styles.identityRow}>
                <Text style={{ width: "30%" }}>b. Pada Tanggal</Text>
                <Text>: {formatDate(student.admittedAt || new Date())}</Text>
              </View>
            </View>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>13.</Text>
            <Text style={styles.identityLabel}>Nama Orang tua</Text>
            <View style={styles.identityValue}>
              <View style={styles.identityRow}>
                <Text style={{ width: "30%" }}>a. Ayah</Text>
                <Text>: {student.fatherName || "-"}</Text>
              </View>
              <View style={styles.identityRow}>
                <Text style={{ width: "30%" }}>b. Ibu</Text>
                <Text>: {student.motherName || "-"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>14.</Text>
            <Text style={styles.identityLabel}>Alamat Orang tua</Text>
            <Text style={styles.identityValue}>: {student.address || "-"}</Text>
          </View>

          <View style={styles.identityRow}>
            <Text style={styles.identityNumber}>15.</Text>
            <Text style={styles.identityLabel}>Pekerjaan Orang tua</Text>
            <View style={styles.identityValue}>
              <View style={styles.identityRow}>
                <Text style={{ width: "30%" }}>a. Ayah</Text>
                <Text>: {student.fatherOccupation || "-"}</Text>
              </View>
              <View style={styles.identityRow}>
                <Text style={{ width: "30%" }}>b. Ibu</Text>
                <Text>: {student.motherOccupation || "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureDate}>
              Buton Tengah, {formatDate(new Date())}
            </Text>
            <Text style={styles.signatureTitle}>Kepala TK Wakea-kea</Text>
            <Text style={styles.signatureName}>
              {schoolInfo.headName || "NASRIAH, S.Pd"}
            </Text>
            <Text style={styles.signatureNIP}>
              NIP. {schoolInfo.headNIP || "19811101 200801 2 008"}
            </Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerWithLogo}>
            <NextImage style={styles.logo} src="/logo.png" />
            <View style={styles.headerText}>
              <Text style={styles.title}>TAMAN KANAK-KANAK WAKEA-KEA</Text>
              <Text style={styles.subtitle}>TK WAKEA-KEA</Text>
            </View>
          </View>
          <Text style={styles.schoolInfo}>{schoolInfo.address}</Text>
          <Text style={styles.schoolInfo}>
            {schoolInfo.city}, {schoolInfo.province}
          </Text>
          <Text style={styles.schoolInfo}>Email: {schoolInfo.email}</Text>

          <Text style={styles.reportTitle}>
            PERKEMBANGAN ANAK DIDIK USIA 4 - 5 TAHUN
          </Text>
          <Text style={styles.semesterInfo}>
            SEMESTER {semester} TAHUN PELAJARAN {academicYear}
          </Text>
        </View>

        <View style={styles.studentBasicInfo}>
          <View style={styles.studentInfoLeft}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NAMA ANAK</Text>
              <Text>: {student.name}</Text>
            </View>
          </View>
          <View style={styles.studentInfoRight}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NIS / NISN</Text>
              <Text>: {student.nis}</Text>
            </View>
          </View>
        </View>

        <View style={styles.assessmentSection}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.tableHeaderNo]}>
                <Text>NO</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableHeaderAspect]}>
                <Text>ASPEK PERKEMBANGAN</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableHeaderResult]}>
                <Text>HASIL PENILAIAN</Text>
              </View>
            </View>

            <View style={styles.tableSubHeader}>
              <View style={[styles.tableHeaderCell, styles.tableHeaderNo]}>
                <Text></Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableHeaderAspect]}>
                <Text></Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableHeaderBaik]}>
                <Text>BAIK</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableHeaderCukup]}>
                <Text>CUKUP</Text>
              </View>
              <View
                style={[
                  styles.tableHeaderCell,
                  styles.tableHeaderPerluDialatih,
                ]}
              >
                <Text>PERLU DILATIH</Text>
              </View>
            </View>

            {Object.entries(groupedAssessments).map(
              ([aspectName, indicators], aspectIndex) => (
                <React.Fragment key={aspectName}>
                  <View style={[styles.tableRow, styles.aspectRow]}>
                    <View style={[styles.tableCell, styles.tableCellNo]}>
                      <Text>{getRomanNumeral(aspectIndex + 1)}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellAspect]}>
                      <Text style={{ fontWeight: "bold" }}>{aspectName}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellBaik]}>
                      <Text></Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellCukup]}>
                      <Text></Text>
                    </View>
                    <View
                      style={[styles.tableCell, styles.tableCellPerluDialatih]}
                    >
                      <Text></Text>
                    </View>
                  </View>

                  {indicators.map((indicator, indicatorIndex) => (
                    <View
                      key={`${aspectName}-${indicatorIndex}`}
                      style={[styles.tableRow, styles.indicatorRow]}
                    >
                      <View style={[styles.tableCell, styles.tableCellNo]}>
                        <Text></Text>
                      </View>

                      <View
                        style={[styles.tableCell, styles.tableCellIndicator]}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <Text style={{ width: "10%", fontWeight: "bold" }}>
                            {indicatorIndex + 1}
                          </Text>
                          <Text style={{ width: "90%" }}>
                            {indicator.indicator}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.tableCell, styles.tableCellBaik]}>
                        <Text style={styles.checkmark}>
                          {indicator.development === "BAIK" ? "O" : ""}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.tableCellCukup]}>
                        <Text style={styles.checkmark}>
                          {indicator.development === "CUKUP" ? "O" : ""}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.tableCell,
                          styles.tableCellPerluDialatih,
                        ]}
                      >
                        <Text style={styles.checkmark}>
                          {indicator.development === "PERLU_DILATIH" ? "O" : ""}
                        </Text>
                      </View>
                    </View>
                  ))}
                </React.Fragment>
              )
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
