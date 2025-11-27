'use client'
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import React, { useEffect, useRef, useState } from 'react'
import { MedicalRecord } from "@/generated/prisma";
import PatientRecords from '@/components/ui/patientRecords';
import { useUploadThing } from "@/lib/uploadthing";

function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("medicalRecordUploader");

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/patient/medical-records/get-records");
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();
      setRecords(data);
    } catch (err: any) {
      console.error("Failed to fetch records:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      console.log("Starting upload for file:", file.name);
      
      // Upload using UploadThing
      const uploadResult = await startUpload([file]);
      
      console.log("Upload result:", uploadResult);
      
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Upload failed - no result returned");
      }

      const url = uploadResult[0].url;
      console.log("File uploaded successfully:", url);

      // Create database record
      const createRes = await fetch("/api/patient/medical-records/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          type: file.type,
          fileUrl: url,
          description: `Uploaded: ${file.name}`,
        }),
      });

      if (createRes.ok) {
        const newRecord = await createRes.json();
        setRecords(prev => [newRecord, ...prev]);
        alert("File uploaded successfully!");
      } else {
        const errorData = await createRes.json();
        throw new Error(errorData.error || "Failed to create record");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <Card className="w-full h-[50vh] max-w-full">
        <CardHeader className="relative flex justify-between items-center px-6">
          <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-600 font-bold text-2xl">
            Medical Records
          </div>
          <div className="ml-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*,application/pdf"
            />
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Record"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="w-full h-full overflow-y-scroll space-y-3 pt-0">
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <PatientRecords medicalRecords={records} setRecords={setRecords} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MedicalRecords;
