import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminStorage } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const {token} = await req.json()
   
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing token." },
        { status: 401 }
      );
    }

    const onboardingData = await prisma.onboardingToken.findUnique({
      where: { token },
    });
    
    if (!onboardingData || onboardingData.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    const phoneNumber = onboardingData.phoneNumber;

    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing file name or content type." },
        { status: 400 }
      );
    }

    const bucket = adminStorage.bucket();
    // Use the phone number to create a unique folder path
    const filePath = `profile-pictures/${phoneNumber}/${Date.now()}-${fileName}`;
    const file = bucket.file(filePath);

    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, 
      contentType: contentType,
    });

    const finalUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json({ signedUrl, finalUrl });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL." },
      { status: 500 }
    );
  }
}
