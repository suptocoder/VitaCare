"use client";
import { useState } from "react";
import AccessRequests from "@/components/ui/AccessRequests";
import FileAccessRequests from "@/components/ui/FileAccessRequests";
import ActiveDoctorAccess from "@/components/ui/ActiveDoctorAccess";
import PatientRecords from "@/components/ui/patientRecords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicalRecord, PatientProfile } from "@/generated/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientDashboardProps {
  user: PatientProfile;
  initialRecords: MedicalRecord[];
}

export default function PatientDashboard({ user, initialRecords }: PatientDashboardProps) {
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            Your UUID: <span className="font-mono font-semibold">{user.patientuuid}</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending-requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="active-access">Active Access</TabsTrigger>
          <TabsTrigger value="file-requests">File Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="pending-requests">
          <AccessRequests />
        </TabsContent>
        <TabsContent value="active-access">
          <ActiveDoctorAccess />
        </TabsContent>
        <TabsContent value="file-requests">
          <FileAccessRequests />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>My Medical Records</CardTitle>
        </CardHeader>
        <CardContent>
          <PatientRecords medicalRecords={records} setRecords={setRecords} />
        </CardContent>
      </Card>
    </div>
  );
}
