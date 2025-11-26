import { getCurrentUser } from "@/lib/user";
import { redirect } from "next/navigation";
import DoctorDash from "@/components/ui/DoctorDash";

export default async function DoctorDashboardPage() {
  
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  if (!("licenseNumber" in user)) {
    redirect("/auth/login?tab=doctor");
  }

  return (
    <div>
      <DoctorDash doctor={user} />
    </div>
  );
}
