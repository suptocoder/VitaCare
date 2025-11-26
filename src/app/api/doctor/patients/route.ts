import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";

export async function GET() {
  try {
    const doctor = await getCurrentUser();

    if (!doctor || !("licenseNumber" in doctor)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const approvedRequests = await prisma.permissionRequest.findMany({
      where: {
        doctorId: doctor.id,
        status: "APPROVED",
      },
      include: {
        patient: {
          select: {
            id: true,
            patientuuid: true,
            fullName: true,
            dateOfBirth: true,
            gender: true,
            BloodGroup: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      patients: approvedRequests.map((req) => ({
        ...req.patient,
        accessGrantedAt: req.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get Patients Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
