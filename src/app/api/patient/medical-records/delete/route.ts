import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || "licenseNumber" in currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recordId } = await req.json();

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    // Verify the record belongs to this patient
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record || record.patientId !== currentUser.id) {
      return NextResponse.json(
        { error: "Record not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the record (cascade will delete file access requests)
    await prisma.medicalRecord.delete({
      where: { id: recordId },
    });

    return NextResponse.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting medical record:", error);
    return NextResponse.json(
      { error: "Failed to delete medical record." },
      { status: 500 }
    );
  }
}
