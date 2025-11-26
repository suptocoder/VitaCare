"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/ws-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorPatientRecords from "@/components/ui/DoctorPatientRecords";



export default function DoctorPatientView({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const { socket } = useSocket();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<any>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      console.log("Fetching records for patient:", patientId);
      const url = `/api/doctor/patient/${patientId}/records`;
      console.log("API URL:", url);
      
      const res = await fetch(url);
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers.get('content-type'));
      
      if (!res.ok) {
        if (res.status === 403) {
          router.push(`/doctor/patient/${patientId}/waiting`);
          return;
        }
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch records: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched data:", data);
      setRecords(data.records || []);
      setPatientInfo(data.patient);
      setLoading(false);
    } catch (e: any) {
      console.error("Fetch error:", e);
      alert(`Error loading records: ${e.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      console.log("Doctor notification:", data);
      
      if (data.type === "ACCESS_REVOKED") {
        alert("Access has been revoked by the patient.");
        router.push("/doctor/dashboard");
      } else if (data.type === "FILE_ACCESS_APPROVED") {
        // File access approved - refresh records
        fetchRecords();
      } else if (data.type === "FILE_ACCESS_REJECTED") {
        alert(`File access denied: ${data.message}`);
        fetchRecords();
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, patientId, router]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patient Records</h1>
          {patientInfo && (
            <p className="text-muted-foreground mt-1">
              {patientInfo.fullName} • {patientInfo.gender} • {patientInfo.bloodGroup}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchRecords}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => router.push("/doctor/dashboard")}
          >
            Close Session
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading records...</p>
          ) : (
            <DoctorPatientRecords records={records} onRefresh={fetchRecords} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
