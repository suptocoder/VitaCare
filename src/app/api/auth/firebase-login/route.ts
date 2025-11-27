import { prisma } from "@/lib/prisma";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import redis from "@/lib/redis";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error("Missing Firebase Admin credentials");
      return NextResponse.json(
        { error: "Server configuration error", details: "Missing Firebase Admin credentials in .env file" },
        { status: 500 }
      );
    }

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token with correct project
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found in token" },
        { status: 400 }
      );
    }

    // if user exist we create a session and log him to dashboard else we throw him to a form on onboarded page to fill out required details
    const patientProfile = await prisma.patientProfile.findUnique({
      where: {
        contactNumber: phoneNumber,
      },
      include: {
        user: true,
      },
    });
    if (patientProfile && patientProfile.isonBoarded) {
      //Case-1 User exist and isOnboarded
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const sessionKey = `session:${sessionToken}`;
      const sessionExpiry = 60 * 60 * 24 * 7; // 7 days

      await prisma.session.create({
        data: {
          token: sessionToken,
          userId: patientProfile.userId,
          expiresAt: new Date(Date.now() + sessionExpiry * 1000),
        },
      });

      (await cookies()).set("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionExpiry,
        path: "/",
      });
      //we are setting on boarded flag to true this is something we will use to redirect to frontend

      return NextResponse.json({ success: true, isOnboarded: true });
    }
    else {
      //Case2 User is not onBoarded
      const onboardingToken = crypto.randomBytes(32).toString("hex");
      const onboardingKey = `onboarding:${onboardingToken}`;

      // Store the verified phone number with this token for 10 minutes
      // This is like a flag so that we can verify that if person trying to onboard is valid or not
      await prisma.onboardingToken.create({
        data: {
          token: onboardingToken,
          phoneNumber: phoneNumber,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      return NextResponse.json({
        success: true,
        isOnboarded: false,
        onboardingToken: onboardingToken,
      });
    }
  } catch (error: any) {
    console.error("Firebase login error:", error);
    return NextResponse.json(
      { error: "Authentication failed", details: error.message },
      { status: 500 }
    );
  }
}
