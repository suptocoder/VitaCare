import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebaseAdmin";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // // Ensure user has patient role
    // if (currentUser. !== "PATIENT") {
    //   return NextResponse.json(
    //     { error: "Access denied: Patient role required" },
    //     { status: 403 }
    //   );
    // }

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

  
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Check access permissions
    const isPatient = !("licenseNumber" in currentUser);
    const isOwner = isPatient && record.patientId === currentUser.id;

    if (!isOwner && "licenseNumber" in currentUser) {
      // Doctor trying to access - check file access
      const fileAccess = await prisma.fileAccessRequest.findUnique({
        where: {
          doctorId_recordId: {
            doctorId: currentUser.id,
            recordId: recordId,
          },
        },
      });

      if (!fileAccess || fileAccess.status !== "APPROVED") {
        return NextResponse.json(
          { error: "File access denied. Request access to this file." },
          { status: 403 }
        );
      }
    } else if (!isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const fileUrl = record.fileUrl;
    console.log(`File URL: ${fileUrl}`);

    // Check if it's UploadThing URL (direct access)
    if (fileUrl.includes("uploadthing") || fileUrl.includes("utfs.io")) {
      return NextResponse.json({
        signedUrl: fileUrl,
        record: {
          id: record.id,
          title: record.title,
          type: record.type,
          uploadDate: record.uploadDate,
          description: record.description,
          isHidden: record.isHidden,
        },
      });
    }

    // Handle Firebase Storage URLs
    if (fileUrl.includes("storage.googleapis.com") || fileUrl.includes("firebasestorage.googleapis.com")) {
      const bucket = adminStorage.bucket("vitacare-v3.appspot.com");
      
      let filePath: string;
      if (fileUrl.includes("storage.googleapis.com")) {
        const urlParts = fileUrl.split("/");
        const bucketIndex = urlParts.findIndex(
          (part) => part.includes("vitacare-v3")
        );
        filePath = urlParts.slice(bucketIndex + 1).join("/");
      } else if (fileUrl.includes("firebasestorage.googleapis.com")) {
        const match = fileUrl.match(/\/o\/(.+?)\?/);
        filePath = match ? decodeURIComponent(match[1]) : "";
      } else {
        throw new Error("Invalid Firebase URL format");
      }

      if (!filePath) {
        throw new Error("Could not extract file path from URL");
      }
      
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      
      if (!exists) {
        console.error(`File does not exist: ${filePath}`);
        return NextResponse.json(
          { error: "File not found in storage" },
          { status: 404 }
        );
      }

      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 60 * 60 * 1000,
      });
      
      return NextResponse.json({
        signedUrl,
        record: {
          id: record.id,
          title: record.title,
          type: record.type,
          uploadDate: record.uploadDate,
          description: record.description,
          isHidden: record.isHidden,
        },
      });
    }

    // For other URLs (placeholder, etc.)
    return NextResponse.json({
      signedUrl: fileUrl,
      record: {
        id: record.id,
        title: record.title,
        type: record.type,
        uploadDate: record.uploadDate,
        description: record.description,
        isHidden: record.isHidden,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to load file data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
