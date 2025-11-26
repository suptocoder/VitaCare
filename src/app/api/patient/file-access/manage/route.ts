import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { sendNotificationtoUser } from "@/lib/websocket";

export async function POST(req: NextRequest) {
  const patient = await getCurrentUser();

  if (!patient || "licenseNumber" in patient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, action } = await req.json(); // "APPROVE" | "REJECT" | "REVOKE"

  let status: "APPROVED" | "REJECTED" | "REVOKED";
  switch (action) {
    case "APPROVE":
      status = "APPROVED";
      break;
    case "REJECT":
      status = "REJECTED";
      break;
    case "REVOKE":
      status = "REVOKED";
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updatedRequest = await prisma.fileAccessRequest.update({
    where: {
      id: requestId,
    },
    data: { status },
    include: {
      doctor: true,
      record: true,
    },
  });

  // Verify the record belongs to this patient
  if (updatedRequest.record.patientId !== patient.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const messages = {
    APPROVED: `${patient.fullName} has approved your access to "${updatedRequest.record.title}"`,
    REJECTED: `${patient.fullName} has denied your access to "${updatedRequest.record.title}"`,
    REVOKED: `${patient.fullName} has revoked your access to "${updatedRequest.record.title}"`,
  };

  sendNotificationtoUser(updatedRequest.doctor.userId, {
    type: `FILE_ACCESS_${status}` as any,
    message: messages[status],
    data: {
      requestId: updatedRequest.id,
      recordId: updatedRequest.recordId,
      patientName: patient.fullName,
    },
  });

  return NextResponse.json({ success: true });
}
