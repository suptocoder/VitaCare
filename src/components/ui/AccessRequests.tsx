"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface AccessRequest {
  id: string;
  createdAt: string;
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    hospitalName: string | null;
    licenseNumber: string;
  };
}

import { useSocket } from "@/contexts/ws-context";

export default function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/patient/access/get-request");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      if (data.type === "ACCESS_REQUESTED") {
        // New request arrived - refresh list
        fetchRequests();
      }
    };

    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  const handleAction = async (requestId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(requestId);
    try {
      const res = await fetch("/api/patient/access/manage", {
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
      <Card className="w-full h-[50vh] max-w-full">
        <CardHeader>
          <div className="flex justify-center text-gray-600 font-bold text-2xl">
            Access Requests
          </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="w-full h-[50vh] max-w-full">
        <CardHeader>
          <div className="flex justify-center text-gray-600 font-bold text-2xl">
            Access Requests
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No pending access requests
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[50vh] max-w-full">
      <CardHeader>
        <div className="flex justify-center text-gray-600 font-bold text-2xl">
          Access Requests
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-[calc(50vh-100px)]">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  Dr. {request.doctor.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {request.doctor.specialization}
                </p>
                {request.doctor.hospitalName && (
                  <p className="text-sm text-muted-foreground">
                    {request.doctor.hospitalName}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  License: {request.doctor.licenseNumber}
                </p>
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
