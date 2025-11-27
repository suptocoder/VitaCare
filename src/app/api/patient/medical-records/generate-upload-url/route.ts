import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";
import { cookies } from "next/headers";
import { adminStorage } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    console.log("=== Generate Upload URL API Called ===");
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    console.log("Session token exists:", !!sessionToken);
  
    const currentUser = await getCurrentUser();
    console.log("Current user:", currentUser?.id);
    
    if (!currentUser) {
      console.error("No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, contentType } = body;
    console.log("File details:", { fileName, contentType });

    if (!fileName || !contentType) {
      console.error("Missing fileName or contentType");
      return NextResponse.json(
        { error: "Missing file name or content type." },
        { status: 400 }
      );
    }

    console.log("Getting Firebase storage bucket...");
    const bucket = adminStorage.bucket();
    console.log("Bucket retrieved:", bucket.name);
    
    const filePath = `medical-records/${currentUser.id}/${Date.now()}-${fileName}`;
    console.log("File path:", filePath);
    
    const file = bucket.file(filePath);

    console.log("Generating signed URL...");
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, 
      contentType: contentType,
    });

    const finalUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log("URLs generated successfully");

    return NextResponse.json({ signedUrl, finalUrl });
  } catch (error: any) {
    console.error("=== Error generating upload URL ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to generate upload URL." },
      { status: 500 }
    );
  }
}
