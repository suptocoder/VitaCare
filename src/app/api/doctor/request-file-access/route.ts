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

    const { recordId } = await req.json();

    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: { patient: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Check if doctor has general access to this patient
    const patientAccess = await prisma.permissionRequest.findUnique({
      where: {
        doctorId_patientId: {
          doctorId: doctor.id,
          patientId: record.patientId,
        },
      },
    });

    if (!patientAccess || patientAccess.status !== "APPROVED") {
      return NextResponse.json(
        { error: "You don't have access to this patient" },
        { status: 403 }
      );
    }

    // Create or update file access request
    const fileAccess = await prisma.fileAccessRequest.upsert({
      where: {
        doctorId_recordId: {
          doctorId: doctor.id,
          recordId: recordId,
        },
      },
      update: {
        status: "PENDING",
        updatedAt: new Date(),
      },
      create: {
        doctorId: doctor.id,
        recordId: recordId,
        status: "PENDING",
      },
    });

    // Send notification to patient
    sendNotificationtoUser(record.patient.userId, {
      type: "ACCESS_REQUESTED",
      message: `Dr. ${doctor.fullName} has requested access to "${record.title}"`,
      data: {
        requestId: fileAccess.id,
        recordId: record.id,
        doctorName: doctor.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "File access request sent",
      status: fileAccess.status,
    });
  } catch (error) {
    console.error("File Access Request Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
