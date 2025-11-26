"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/ui/AuthProvider";
import { auth } from "@/lib/firebase";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";

function VerifyFormComponent() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phone");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Get real verificationId from sessionStorage (set in Login page)
      const verificationId = sessionStorage.getItem("verificationId");

      if (!verificationId) {
        throw new Error(
          "Verification session lost. Please go back and try again."
        );
      }

      // 🟢 FIX: REMOVED THE "isDevelopmentMode" BLOCK.
      // We now execute the REAL verification logic below.

      // 1. Verify OTP with Firebase (Real or Test Number)
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);

      // 2. Get the real ID Token from the result
      const idToken = await result.user.getIdToken();

      // Clear the stored verificationId
      sessionStorage.removeItem("verificationId");
      sessionStorage.removeItem("phoneNumber");

      // 3. Send ID Token to Backend (This saves the token to Redis!)
      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Your session could not be created.");
      }

      const data = await res.json();

      if (data.isOnboarded) {
        await login();
        router.push("/patient/dashboard");
      } else {
        // 4. Redirect with the REAL backend-generated token
        const token = data.onboardingToken;
        router.push(`/onboarding?token=${token}`);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "The code you entered is invalid.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-[80vh] justify-center items-center flex-col">
      <Card className="w-[50vw] max-w-md">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to +91{phoneNumber}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="123456"
              required
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
          <CardFooter className="mt-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyFormComponent />
    </Suspense>
  );
}
