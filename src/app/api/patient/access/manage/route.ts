import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { sendNotificationtoUser } from "@/lib/websocket";

export async function POST(req: NextRequest) {
  const patient = await getCurrentUser();

  if (
    !patient || // Condition 1: Is the user missing? (Not logged in)
    "licenseNumber" in patient // Condition 2: Does the user have a license number? (Is a Doctor)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); // BLOCK THEM
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

  const updatedRequest = await prisma.permissionRequest.update({
    where: {
      id: requestId,
      patientId: patient.id, 
    },
    data: { status },
    include: { doctor: true },
  });


  const messages = {
    APPROVED: `${patient.fullName} has approved your access request.`,
    REJECTED: `${patient.fullName} has denied your access request.`,
    REVOKED: `${patient.fullName} has revoked your access.`,
  };

  sendNotificationtoUser(updatedRequest.doctor.userId, {
    type: `ACCESS_${status}` as any,
    message: messages[status],
    data: {
      requestId: updatedRequest.id,
      patientName: patient.fullName,
    },
  });

  return NextResponse.json({ success: true });
}
