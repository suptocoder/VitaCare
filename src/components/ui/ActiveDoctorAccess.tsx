"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, Loader2, Shield } from "lucide-react";

interface ActiveAccess {
  id: string;
  updatedAt: string;
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    hospitalName: string | null;
    licenseNumber: string;
  };
}

export default function ActiveDoctorAccess() {
  const [activeAccess, setActiveAccess] = useState<ActiveAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchActiveAccess = async () => {
    try {
      const res = await fetch("/api/patient/access/get-active");
      if (res.ok) {
        const data = await res.json();
        setActiveAccess(data.activeAccess || []);
      }
    } catch (error) {
      console.error("Failed to fetch active access:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAccess();
  }, []);

  const handleRevoke = async (requestId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to revoke access for Dr. ${doctorName}?`)) {
      return;
    }

    setRevokingId(requestId);
    try {
      const res = await fetch("/api/patient/access/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "REVOKE" }),
      });

      if (res.ok) {
        setActiveAccess((prev) => prev.filter((access) => access.id !== requestId));
        alert("Access revoked successfully");
      }
    } catch (error) {
      console.error("Failed to revoke access:", error);
      alert("Failed to revoke access");
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Doctor Access
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (activeAccess.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Doctor Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No doctors currently have access to your records
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Doctor Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAccess.map((access) => (
          <div
            key={access.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  Dr. {access.doctor.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {access.doctor.specialization}
                </p>
                {access.doctor.hospitalName && (
                  <p className="text-sm text-muted-foreground">
                    {access.doctor.hospitalName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  License: {access.doctor.licenseNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  Access granted: {new Date(access.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRevoke(access.id, access.doctor.fullName)}
              disabled={revokingId === access.id}
              className="w-full"
            >
              {revokingId === access.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserX className="h-4 w-4 mr-2" />
              )}
              Revoke Access
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
