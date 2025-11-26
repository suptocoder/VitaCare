"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DoctorProfile } from "@/generated/prisma";
import { useSocket } from "@/contexts/ws-context";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface DoctorDashProps {
  doctor: DoctorProfile;
}

function DoctorDash({ doctor }: DoctorDashProps) {
 
   const [patientIdInput, setPatientIdInput] = useState("");
   const [status, setStatus] = useState<string | null>(null);
   const { notifications } = useSocket();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!patientIdInput.trim()) return;

  setIsLoading(true);
  setError(null);

  try {
    const res = await fetch("/api/doctor/access/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientUuid: patientIdInput.toUpperCase() }),
    });

    const data = await res.json();

    if (!res.ok) {
      // "if patient doesnt exist we throw error"
      setError(data.error || "Patient not found.");
      setIsLoading(false);
      return;
    }

    // Logic: "redirect to waiting page as soon as doctor enters patients id"
    if (data.status === "APPROVED") {
      router.push(`/doctor/patient/${patientIdInput}`);
    } else {
      router.push(`/doctor/patient/${patientIdInput}/waiting`);
    }
  } catch (err: any) {
    setError("Network error occurred.");
    setIsLoading(false);
  }
};

  function RecentPatients() {
    const [patients, setPatients] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
      fetch("/api/doctor/patients")
        .then((res) => res.json())
        .then((data) => setPatients(data.patients || []))
        .catch(console.error);
    }, []);

    if (patients.length === 0) return null;

    return (
      <div className="mt-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>
              Patients you've recently accessed or treated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/doctor/patient/${patient.patientuuid}`)}
                >
                  <div>
                    <p className="font-semibold">{patient.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      UUID: {patient.patientuuid} • {patient.gender} • {patient.BloodGroup}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Records
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Doctor Dashboard</h1>
        <p className="text-gray-900 text-2xl mt-2">
          Welcome, Dr. {doctor.fullName}. Manage your Patients Records here
          here.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Find a Patient</CardTitle>
            <CardDescription>
              Enter a patient's unique ID to access their medical records.
            </CardDescription>
          </CardHeader>
       <form onSubmit={handleSearch}>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="patientId">Patient UUID</Label>
                <Input
                  id="patientId"
                  placeholder="e.g. 8A3D4F1B"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-red-500 mt-4 font-semibold">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full mt-4 " disabled={isLoading}>
                {isLoading ? "Verifying..." : "Request Access"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <RecentPatients />
    </main>
  );
}

export default DoctorDash;
