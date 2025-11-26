"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "./button";
import { Eye, Lock, Unlock, Loader2 } from "lucide-react";
import { Badge } from "./badge";

interface MedicalRecordWithAccess {
  id: string;
  title: string;
  type: string;
  uploadDate: Date;
  description: string | null;
  accessStatus: string;
}

interface DoctorPatientRecordsProps {
  records: MedicalRecordWithAccess[];
  onRefresh: () => void;
}

export default function DoctorPatientRecords({ records, onRefresh }: DoctorPatientRecordsProps) {
  const [requestingId, setRequestingId] = useState<string | null>(null);

  if (!records || records.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No medical records available.
      </p>
    );
  }

  const handleRequestAccess = async (recordId: string) => {
    setRequestingId(recordId);
    try {
      const res = await fetch("/api/doctor/request-file-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId }),
      });

      if (res.ok) {
        alert("Access request sent to patient");
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to request access");
      }
    } catch (error) {
      console.error("Request access error:", error);
      alert("Failed to request access");
    } finally {
      setRequestingId(null);
    }
  };

  const handleViewFile = (recordId: string) => {
    window.open(`/view-record/${recordId}`, "_blank");
  };

  return (
    <div className="space-y-3 p-1">
      {records.map((record) => {
        const accessStatus = record.accessStatus;
        const canView = accessStatus === "APPROVED";
        const isPending = accessStatus === "PENDING";
        const notRequested = accessStatus === "NOT_REQUESTED";

        return (
          <div
            key={record.id}
            className="w-full p-4 border rounded-lg flex items-center justify-between transition-all hover:shadow-md hover:border-primary/50"
          >
            <div className="flex-grow pr-4">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{record.title}</p>
                {canView && <Badge variant="default">Access Granted</Badge>}
                {isPending && <Badge variant="outline">Pending Approval</Badge>}
                {notRequested && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="text-sm text-gray-500">
                Uploaded: {format(new Date(record.uploadDate), "PPP")}
              </p>
              {record.description && (
                <p className="text-xs text-gray-400 mt-1">{record.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              {canView ? (
                <Button
                  size="sm"
                  onClick={() => handleViewFile(record.id)}
                  className="h-8 px-3 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View File
                </Button>
              ) : isPending ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="h-8 px-3 text-xs"
                >
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Waiting
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRequestAccess(record.id)}
                  disabled={requestingId === record.id}
                  className="h-8 px-3 text-xs"
                >
                  {requestingId === record.id ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Unlock className="h-3 w-3 mr-1" />
                  )}
                  Request Access
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
