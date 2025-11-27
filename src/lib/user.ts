import { PatientProfile,DoctorProfile } from "@/generated/prisma";
import { cache } from "react";
import redis from "./redis";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const getUser = cache(
  async (sessionToken :string): Promise<PatientProfile | null | DoctorProfile> => {
  

    if (!sessionToken) {
      console.log("No session token provided");
      return null;
    }

    const sessionKey = `session:${sessionToken}`;
    console.log("Looking up session:", sessionKey);
    
    const sessionData = await redis.get<string>(sessionKey);
    console.log("Session data from Redis:", sessionData);

    if (!sessionData) {
      console.log("No session data found in Redis");
      return null;
    }

    try {
      const { userId } = JSON.parse(sessionData);
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
