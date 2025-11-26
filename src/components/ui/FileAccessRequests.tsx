"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, FileText } from "lucide-react";

interface FileAccessRequest {
  id: string;
  createdAt: string;
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    hospitalName: string | null;
    licenseNumber: string;
  };
  record: {
    id: string;
    title: string;
    type: string;
    uploadDate: string;
  };
}

export default function FileAccessRequests() {
  const [requests, setRequests] = useState<FileAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/patient/file-access/get-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to fetch file access requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(requestId);
    try {
      const res = await fetch("/api/patient/file-access/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to process request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>File Access Requests</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>File Access Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No pending file access requests
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>File Access Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold">{request.record.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Dr. {request.doctor.fullName} • {request.doctor.specialization}
                </p>
                {request.doctor.hospitalName && (
                  <p className="text-xs text-muted-foreground">
                    {request.doctor.hospitalName}
                  </p>
                )}
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(request.id, "APPROVE")}
                disabled={processingId === request.id}
                className="flex-1"
              >
                {processingId === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction(request.id, "REJECT")}
                disabled={processingId === request.id}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deny
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
