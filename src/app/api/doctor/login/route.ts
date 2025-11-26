import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import redis from "@/lib/redis";
import { cookies } from "next/headers";
import { Role } from "@/generated/prisma";

const loginSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(req: NextRequest) {
  try {
  
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { email, password } = validation.data;

    // 3. Find the doctor by their email address
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { email },
      include: { user: true }, 
    });


    if (!doctorProfile || !(await bcrypt.compare(password, doctorProfile.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }


    if (doctorProfile.user.role !== Role.DOCTOR) {
        return NextResponse.json({ error: "Access denied. Not a doctor account." }, { status: 403 });
    }

  
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionKey = `session:${sessionToken}`;
    const sessionExpiry = 60 * 60 * 24 * 7; // 7 days in seconds

    await redis.set(
      sessionKey,
      JSON.stringify({ userId: doctorProfile.userId }), // Store the main User ID in the session
      "EX",
      sessionExpiry
    );

   
   (await cookies()).set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionExpiry,
      path: "/",
    });

    return NextResponse.json({ message: "Login successful." }, { status: 200 });

  } catch (error) {
    console.error("Doctor login error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
