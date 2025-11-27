import { PatientProfile,DoctorProfile } from "@/generated/prisma";
import { cache } from "react";
import redis from "./redis";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const getUser = cache(
  async (sessionToken :string): Promise<PatientProfile | null | DoctorProfile> => {
  

    if (!sessionToken) {
      return null;
    }

    const sessionKey = `session:${sessionToken}`;
    const sessionData = await redis.get<string>(sessionKey);

    if (!sessionData) {
      return null;
    }

    try {
      const { userId } = JSON.parse(sessionData);

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
