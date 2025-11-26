import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const doctor = await getCurrentUser();
    const { patientId } = await params;

    if (!doctor || !("licenseNumber" in doctor)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await prisma.patientProfile.findUnique({
      where: { patientuuid: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const permission = await prisma.permissionRequest.findUnique({
      where: {
        doctorId_patientId: {
          doctorId: doctor.id,
          patientId: patient.id,
        },
      },
    });

    if (!permission || permission.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Access not granted" },
        { status: 403 }
      );
    }

    const records = await prisma.medicalRecord.findMany({
      where: {
        patientId: patient.id,
        isHidden: false,
      },
      include: {
        fileAccessRequests: {
          where: {
            doctorId: doctor.id,
          },
        },
      },
      orderBy: {
        uploadDate: "desc",
      },
    });

    // Map records with access status
    const recordsWithAccess = records.map((record) => ({
      ...record,
      accessStatus: record.fileAccessRequests[0]?.status || "NOT_REQUESTED",
      fileAccessRequests: undefined, // Remove from response
    }));

    return NextResponse.json({
      patient: {
        id: patient.id,
        uuid: patient.patientuuid,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.BloodGroup,
        contactNumber: patient.contactNumber,
      },
      records: recordsWithAccess,
    });
  } catch (error) {
    console.error("Fetch Records Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
