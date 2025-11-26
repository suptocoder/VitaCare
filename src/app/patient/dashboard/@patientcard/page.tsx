import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/user";
import { bloodgroup } from "@/generated/prisma";
import Image from "next/image";
import Link from "next/link";
import { Copy } from "lucide-react";
import { cookies } from "next/headers";
import { cache } from "react";

const bloodGroupDisplay: Record<bloodgroup, string> = {
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
};

const calculateAge = cache((dob: Date | null): number | string => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
})

export default async function PatientCardPage() {
    const cookieStore = await cookies();
   const sessionToken = cookieStore.get("session_token")?.value;
   let patient;
   if(!sessionToken){
    patient = null;
   } else {
    patient = await getCurrentUser();
   }

  if (!patient) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Could not load patient data.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div>
      <Card className="w-full max-w-full">
        <CardHeader>
        <div className="flex justify-center text-gray-600 font-bold text-2xl">
            Patient Card
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 rounded-full bg-muted overflow-hidden flex-shrink-0">
              {patient.profilePictureUrl ? (
                <Image
                  src={patient.profilePictureUrl}
                  alt="Profile Picture"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-grow ">
              <CardTitle>{patient.fullName}</CardTitle>
              <CardDescription className="mt-2">
                {patient.gender} | Age: {calculateAge(patient.dateOfBirth)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">
                Blood Group
              </span>
              <span className="font-semibold text-foreground">
                {bloodGroupDisplay[patient.BloodGroup]}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">
                Patient ID
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-foreground p-1 bg-muted rounded-md text-xs">
                  {patient.patientuuid}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Contact</span>
              <span className="text-foreground">{patient.contactNumber}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/patient/dashboard/profile">View Full Profile</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
