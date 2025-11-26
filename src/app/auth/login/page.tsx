"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/ui/AuthProvider";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();

  const currentTab = searchParams.get("tab") || "patient";

  const validatePhoneNumber = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    const indianMobileRegex = /^[6-9]\d{9}$/;
    return indianMobileRegex.test(cleaned);
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const formatPhoneNumber = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.slice(0, 10);
  }, []);

  // Setup Firebase for testing mode on localhost
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      try {
        // @ts-ignore
        auth.settings.appVerificationDisabledForTesting = true;
        console.log(
          "🔧 Firebase Testing Mode Enabled (No actual SMS will be sent for Test Numbers)"
        );
      } catch (error) {
        console.log("Testing mode setup:", error);
      }
    }
  }, []);

  useEffect(() => {
    const initializeRecaptcha = async () => {
      if (
        currentTab === "patient" &&
        !window.recaptchaVerifier &&
        recaptchaContainerRef.current
      ) {
        try {
          // Clean up any existing instance first
          if (window.recaptchaVerifier) {
            (window.recaptchaVerifier as RecaptchaVerifier).clear();
          }

          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            recaptchaContainerRef.current,
            {
              size: "normal",
              callback: (response: string) => {
                console.log("reCAPTCHA resolved");
                setIsRecaptchaReady(true);
              },
              "expired-callback": () => {
                console.error("reCAPTCHA expired");
                setError("Security check expired. Please try again.");
                setIsRecaptchaReady(false);
              },
            }
          );

          await window.recaptchaVerifier.render();
          setIsRecaptchaReady(true);
        } catch (error) {
          console.error("reCAPTCHA initialization error:", error);
          // Even if Recaptcha fails visually in dev, we might be able to proceed if appVerificationDisabledForTesting is true
          if (process.env.NODE_ENV === "development") {
            setIsRecaptchaReady(true);
          } else {
            setError("Failed to initialize security check. Please refresh.");
          }
        }
      } else if (currentTab === "doctor") {

        setIsRecaptchaReady(false);
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear(); // <--- This stops the "Expired" timer
            window.recaptchaVerifier = undefined;
          } catch (e) {
            console.warn("Failed to clear recaptcha", e);
          }
      }
    };

    initializeRecaptcha();

    return () => {
      if (window.recaptchaVerifier && currentTab !== "patient") {
        try {
          (window.recaptchaVerifier as RecaptchaVerifier).clear();
        } catch (e) {
          console.warn(e);
        }
        window.recaptchaVerifier = undefined;
        setIsRecaptchaReady(false);
      }
    }
    };
  }, [currentTab]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/auth/login?${params.toString()}`);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError("");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (currentTab === "patient") {
        if (!validatePhoneNumber(phoneNumber)) {
          throw new Error("Please enter a valid 10-digit mobile number.");
        }

        // 🟢 FIX: REMOVED THE "IF DEV MODE RETURN" BLOCK.
        // We now ALWAYS proceed to the real Firebase call below.

        if (!window.recaptchaVerifier) {
          if (recaptchaContainerRef.current) {
            window.recaptchaVerifier = new RecaptchaVerifier(
              auth,
              recaptchaContainerRef.current,
              {
                size: "normal",
                callback: (response: string) => {
                  setIsRecaptchaReady(true);
                },
                "expired-callback": () => {
                  setError("Security check expired. Please try again.");
                  setIsRecaptchaReady(false);
                },
              }
            );
            await window.recaptchaVerifier.render();
          } else {
            throw new Error("Security verification is not ready. Please refresh.");
          }
        }

        const formattedPhoneNumber = `+91${phoneNumber}`;
        console.log("Sending OTP to:", formattedPhoneNumber);

        // This generates a REAL verification ID from Firebase
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          formattedPhoneNumber,
          window.recaptchaVerifier
        );

        // Store the real ID
        sessionStorage.setItem(
          "verificationId",
          confirmationResult.verificationId
        );
        sessionStorage.setItem("phoneNumber", phoneNumber);

        // Remove this flag so verify page behaves correctly
        sessionStorage.removeItem("isDevelopmentMode");

        router.push(`/auth/verify?phone=${phoneNumber}`);
      } else if (currentTab === "doctor") {
        if (!validateEmail(email)) throw new Error("Invalid email.");
        if (password.length < 6) throw new Error("Password too short.");

        const response = await fetch("/api/doctor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok || data.error) {
          throw new Error(data.error || "Login failed.");
        }

        await login();
        router.push("/doctor/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message);
      // Reset recaptcha on error so user can try again
      if (currentTab === "patient" && window.recaptchaVerifier) {
        window.recaptchaVerifier.render().catch(console.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPatientForm = () => (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mobile-number">Mobile Number</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              +91
            </span>
            <Input
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              id="mobile-number"
              type="tel"
              placeholder="10-digit mobile number"
              className="pl-12"
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <div ref={recaptchaContainerRef} className="flex justify-center my-4" />
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={isLoading} className="w-full mt-2">
          {isLoading ? "Sending OTP..." : "Send OTP as Patient"}
        </Button>
      </CardFooter>
    </form>
  );

  const renderDoctorForm = () => (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            value={email}
            onChange={handleEmailChange}
            type="email"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            value={password}
            onChange={handlePasswordChange}
            type="password"
            required
            disabled={isLoading}
          />
        </div>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={isLoading} className="w-full mt-2">
          {isLoading ? "Logging in..." : "Login as Doctor"}
        </Button>
      </CardFooter>
    </form>
  );

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Login/SignUp</CardTitle>
          <CardDescription>Select your role to continue.</CardDescription>
        </CardHeader>
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="doctor">Doctor</TabsTrigger>
          </TabsList>
          <TabsContent value="patient" className="mt-4">
            {renderPatientForm()}
          </TabsContent>
          <TabsContent value="doctor" className="mt-4">
            {renderDoctorForm()}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
