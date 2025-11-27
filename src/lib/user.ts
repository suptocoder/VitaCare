import { PatientProfile,DoctorProfile } from "@/generated/prisma";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const getUser = cache(
  async (sessionToken :string): Promise<PatientProfile | null | DoctorProfile> => {
  

    if (!sessionToken) {
      console.log("No session token provided");
      return null;
    }

    console.log("Looking up session:", sessionToken);
    
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });
    
    console.log("Session from database:", session);

    if (!session || session.expiresAt < new Date()) {
      console.log("No valid session found");
      return null;
    }

    try {
      const userId = session.userId;
      console.log("Found userId:", userId);

      if (!userId) {
        return null;
      }

      const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        include: {
          patientProfile: true,
          doctorProfile: true,
        },
      });
      if(!user){
        return null;
      }
      if (user.role === "PATIENT") {
        return user.patientProfile as PatientProfile;
      }
      if (user.role === "DOCTOR") {
        console.log("doctorprofile",user.doctorProfile)
        return user.doctorProfile as DoctorProfile;
      }
      return null;

      // return patientProfile;
    } catch (error) {
      console.error("Failed to parse session data:", error);
      return null;
    }
  }
);
export const getCurrentUser = async ()=>{
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const user = await getUser(sessionToken);
  return user;

}
