import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { Role,bloodgroup} from "@/generated/prisma"; 


const GenderEnum = z.enum(["Male", "Female", "Other"]);


const patientSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long."),
 dateOfBirth: z.string().datetime().optional().nullable(),
  gender: GenderEnum.optional().nullable(),
  address: z.string().optional().nullable(),
  Bloodgroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
  profilePictureUrl: z.string().url().optional().nullable(),
  onboardingToken: z.string().min(1, "Onboarding token is required."),
});
function mapBloodGroupToEnum(displayValue: string): bloodgroup {
  const mapping: Record<string, bloodgroup> = {
    "O+": "O_POSITIVE",
    "O-": "O_NEGATIVE",
    "A+": "A_POSITIVE",
    "A-": "A_NEGATIVE",
    "B+": "B_POSITIVE",
    "B-": "B_NEGATIVE",
    "AB+": "AB_POSITIVE",
    "AB-": "AB_NEGATIVE",
  };

  return mapping[displayValue] as bloodgroup;
}
// when we create uuid we need to ensure it is unique not already in db if already in 
async function generateUniquePatientId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
  // 8 character hex string
    const patientId = crypto.randomBytes(4).toString("hex").toUpperCase();

    // Check if this ID already exists
    const existingPatient = await prisma.patientProfile.findUnique({
      where: { patientuuid: patientId },
    });

    if (!existingPatient) {
      return patientId;
    }

    attempts++;
  }

  throw new Error(
    "Unable to generate unique patient ID after maximum attempts"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

   
    const validation = patientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      fullName,
      dateOfBirth,
      gender,
      address,
      Bloodgroup,
      profilePictureUrl:profilepicture,
      onboardingToken,
    } = validation.data;


    const onboardingData = await prisma.onboardingToken.findUnique({
      where: { token: onboardingToken },
    });

    if (!onboardingData || onboardingData.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    const phoneNumber = onboardingData.phoneNumber;

    await prisma.onboardingToken.delete({
      where: { token: onboardingToken },
    });

   
    const existingUser = await prisma.patientProfile.findUnique({
      where: { contactNumber: phoneNumber },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
        { status: 409 }
      );
    }
    const patientuuid = await generateUniquePatientId()
   const bloodGroupEnum = mapBloodGroupToEnum(Bloodgroup);
    const newUser = await prisma.user.create({
      data: {
        role: Role.PATIENT,
        patientProfile: {
          create: {
            fullName,
            BloodGroup: bloodGroupEnum as bloodgroup,
            contactNumber: phoneNumber,
            patientuuid:patientuuid,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender,
            address: address || null,
            profilePictureUrl: profilepicture || null,
            isonBoarded: true,
          },
        },
      },
    });

 
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionKey = `session:${sessionToken}`;
    const sessionExpiry = 60 * 60 * 24 * 7; // 7 days

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + sessionExpiry * 1000),
      },
    });

  (await cookies()).set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionExpiry,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
