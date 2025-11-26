"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { DatePicker } from "./datepicker";

const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Neurologist",
  "Oncologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "Radiologist",
  "Surgeon",
  "Urologist",
  "Gynecologist",
  "Ophthalmologist",
  "ENT Specialist",
  "Dentist",
  "Other",
];

const qualificationOptions = [
  "MBBS",
  "MD",
  "MS",
  "DM",
  "MCh",
  "DNB",
  "PhD",
  "MRCP",
  "FRCS",
  "Other",
];

export default function DoctorRegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: undefined as Date | undefined,
    gender: "",
    contactNumber: "",
    email: "",
    password: "",
    verifypassword:"",
    licenseNumber: "",
    specialization: "",
    qualifications: [] as string[],
    yearsOfExperience: "",
    hospitalName: "",
    hospitalAddress: "",
    departmentName: "",
    profilePicture: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
     if(name === "yearsOfExperience" && value<'0') {
      return;
     }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleQualificationChange = (qualification: string) => {

    setFormData((prev) => {
      const newQualifications = prev.qualifications.includes(qualification)
        ? prev.qualifications.filter((q) => q !== qualification)
        : [...prev.qualifications, qualification];
      return { ...prev, qualifications: newQualifications };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("formdata",formData)
     if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, profilePicture: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
     if (!formData.fullName.trim()) {
       setError("Full Name is required.");
       return;
     }
     if (!formData.email.trim()) {
       setError("Email is required.");
       return;
     }
     if(formData.password !== formData.verifypassword){
        setError("Passwords do not match.");
     }
     if (!formData.password) {
       setError("Password is required.");
       return;
     }
     if (formData.password.length < 6) {
       setError("Password must be at least 6 characters long.");
       return;
     }
     if (!formData.licenseNumber.trim()) {
       setError("Medical License Number is required.");
       return;
     }
     if (!formData.specialization) {
       setError("Please select a specialization.");
       return;
     }
     if (formData.qualifications.length === 0) {
       setError("Please select at least one qualification.");
       return;
     }
     if (!formData.yearsOfExperience) {
       setError("Years of experience is required.");
       return;
     }

    try {
    
      const response = await fetch("/api/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth?.toISOString(),
          yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
          profilePicture: null, 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed.");
      }

      alert("Registration successful! Please log in.");
      router.push("/auth/login?tab=Doctor");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Doctor Registration</CardTitle>
        <CardDescription>
          Create your professional account to get started.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Date of Birth</Label>
                <DatePicker
                  date={formData.dateOfBirth}
                  setDate={handleDateChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <Select
                  name="gender"
                  onValueChange={(v) => handleSelectChange("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              Account Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Verify Password</Label>
                <Input
                  name="verifypassword"
                  type="verifypassword"
                  value={formData.verifypassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="licenseNumber">Medical License Number</Label>
                <Input
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Specialization</Label>
                <Select
                  name="specialization"
                  onValueChange={(v) => handleSelectChange("specialization", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Qualifications</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 border rounded-md">
                  {qualificationOptions.map((q) => (
                    <div key={q} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={q}
                        checked={formData.qualifications.includes(q)}
                        onChange={() => handleQualificationChange(q)}
                      />
                      <Label htmlFor={q}>{q}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Affiliation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              Affiliation (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  name="departmentName"
                  value={formData.departmentName}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="hospitalAddress">Hospital Address</Label>
                <Input
                  name="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="mt-2">

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
