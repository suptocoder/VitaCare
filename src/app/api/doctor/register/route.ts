import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { gender,Role } from "@/generated/prisma";
const doctorRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  licenseNumber: z.string().min(1, "License number is required"),
  specialization: z.string().min(1, "Specialization is required"),
  qualifications: z.array(z.string()).min(1, "At least one qualification is required"),
  yearsOfExperience: z.number().int().min(0),
  // Optional fields
  dateOfBirth: z.string().optional(),
  gender: z.nativeEnum(gender).optional(),
  contactNumber: z.string().optional(),
  hospitalName: z.string().optional(),
  hospitalAddress: z.string().optional(),
  departmentName: z.string().optional(),
});
export async function POST(req: NextRequest) {
  try {

    const body = await req.json();
    const validation = doctorRegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      fullName,
      email,
      password,
      licenseNumber,
      specialization,
      qualifications,
      yearsOfExperience,
      dateOfBirth,
      gender,
      contactNumber,
      hospitalName,
      hospitalAddress,
      departmentName,
    } = validation.data;
 
  const existingDoctor = await prisma.doctorProfile.findFirst({
    where: { OR: [{ email }, { licenseNumber }] },
  });
    if (existingDoctor) {
      return NextResponse.json(
        { error: "A doctor with this email or license number already exists." },
        { status: 409 }
      );
    }

    
    const passwordHash = await bcrypt.hash(password, 10); 

    await prisma.user.create({
      data: {
        role: Role.DOCTOR,
        doctorProfile: {
          create: {
            fullName,
            email,
            password: passwordHash, 
            licenseNumber,
            specialization,
            qualification: qualifications,
            yearsOfExperience,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender,
            contactNumber: contactNumber,
            hospitalName: hospitalName,
            hospitalAddress: hospitalAddress,
            departmentName: departmentName,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Doctor registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Doctor registration error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
