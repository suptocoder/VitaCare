import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { sendNotificationtoUser } from "@/lib/websocket";

export async function POST(req: NextRequest) {
  try {
    const doctor = await getCurrentUser();

    
    if (!doctor || !("licenseNumber" in doctor)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientUuid } = await req.json();


    const patient = await prisma.patientProfile.findUnique({
      where: { patientuuid: patientUuid },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

   const existingPermission = await prisma.permissionRequest.findUnique({
     where: {
       doctorId_patientId: {
         doctorId: doctor.id,
         patientId: patient.id,
       },
     },
   });

   
   if (existingPermission && existingPermission.status === "APPROVED") {
     return NextResponse.json({
       success: true,
       status: "APPROVED",
       patientId: patient.id,
     });
   }

   const permission = await prisma.permissionRequest.upsert({
     where: {
       doctorId_patientId: {
         doctorId: doctor.id,
         patientId: patient.id,
       },
     },
     update: { status: "PENDING" },
     create: {
       doctorId: doctor.id,
       patientId: patient.id,
       status: "PENDING",
     },
   });
    sendNotificationtoUser(patient.userId, {
      type: "ACCESS_REQUESTED",
      message: `Dr. ${doctor.fullName} has requested access to your medical records.`,
      data: {
        requestId: permission.id,
        doctorName: doctor.fullName,
        doctorSpecialization: doctor.specialization,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Access request sent to patient.",
      status: permission.status,
    });
    
  } catch (error) {
    console.error("Access Request Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
