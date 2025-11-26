"use client";
import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/ws-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function WaitingForApproval({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const router = useRouter();
  const { socket, notifications } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      console.log("Notification received:", data);
      if (data.type === "ACCESS_APPROVED") {
        // Instant redirect on approval
        router.push(`/doctor/patient/${patientId}`);
        router.refresh();
      } else if (data.type === "ACCESS_REJECTED") {
        alert("Patient denied your access request.");
        router.push("/doctor/dashboard");
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, patientId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Waiting for Patient Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              Your access request has been sent to the patient. Please wait for their approval.
            </p>
            <p className="text-sm text-center text-gray-500">
              Patient ID: <span className="font-mono font-semibold">{patientId}</span>
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/doctor/dashboard")}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
