"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/datepicker";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

 
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [gender, setGender] = useState("");
  const [Bloodgroup,setBloodgroup]=useState("");
  const [address, setAddress] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const bloodgrps = ['O-','O+','A+','A-','B-','B+','AB-','AB+']
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
const token = searchParams.get("token");
  useEffect(() => {
    
    if (token) {
      setOnboardingToken(token);
    } else {
      setError("Invalid onboarding session. Please start over.");
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePictureFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!onboardingToken) {
      setError("Session expired. Please log in again.");
      setIsLoading(false);
      return;
    }
    

    try {
      let profilePictureUrl: string | null = null;

  //If a profile picture is selected, get a secure URL and upload it
      if (profilePictureFile) {
        const urlRes = await fetch("/api/patient/generate-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: profilePictureFile.name,
            contentType: profilePictureFile.type,
            token:token,
          }),
        });

        if (!urlRes.ok) throw new Error("Could not prepare file for upload.");
        const { signedUrl, finalUrl } = await urlRes.json();
        profilePictureUrl = finalUrl;

        await fetch(signedUrl, {
          method: "PUT",
          body: profilePictureFile,
          headers: { "Content-Type": profilePictureFile.type },
        });
      }

      // We arrange data in a better way
      const registrationData = {
        fullName,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
        gender,
        Bloodgroup,
        address,
        profilePictureUrl,
        onboardingToken,
      };

      // Register the user
      const registerRes = await fetch("/api/patient/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      if (!registerRes.ok) {
        const { error } = await registerRes.json();
        throw new Error(error || "Failed to create account.");
      }

      router.push("/patient/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome! Please fill in your details to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Date of Birth</Label>
              <DatePicker date={dateOfBirth} setDate={setDateOfBirth} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={setGender} value={gender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bloodgroup">Blood Group</Label>

              <Select onValueChange={setBloodgroup} value={Bloodgroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your BloodGroup" />
                </SelectTrigger>
                <SelectContent>
                    {bloodgrps.map((bloodgroup,index)=>{
                        return <SelectItem key={bloodgroup} value={`${bloodgroup}`}>{bloodgroup}</SelectItem>;
                    })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
              <Input
                id="profilePicture"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button
              className="p-4 mt-4"
              type="submit"
              disabled={isLoading || !onboardingToken}
            >
              {isLoading ? "Saving..." : "Save and Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
