import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";

export async function GET() {
  try {
    const patient = await getCurrentUser();

    if (!patient || "licenseNumber" in patient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeAccess = await prisma.permissionRequest.findMany({
      where: {
        patientId: patient.id,
        status: "APPROVED",
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            hospitalName: true,
            licenseNumber: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ activeAccess });
  } catch (error) {
    console.error("Get Active Access Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
