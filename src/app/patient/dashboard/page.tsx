import { getCurrentUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientDashboard from "@/components/ui/PatientDashboard";

export default async function PatientDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if ("licenseNumber" in user) {
    redirect("/doctor/dashboard");
  }

  const records = await prisma.medicalRecord.findMany({
    where: { patientId: user.id },
    orderBy: { uploadDate: "desc" },
  });

  return <PatientDashboard user={user} initialRecords={records} />;
}


