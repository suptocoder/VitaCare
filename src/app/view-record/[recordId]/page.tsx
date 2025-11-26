"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicalRecord } from "@/generated/prisma";

interface ViewRecordProps {
  params: Promise<{ recordId: string }>;
}

export interface Data {
  signedUrl: string;
  record: MedicalRecord;
}

export default function ViewRecord({ params }: ViewRecordProps) {
  const router = useRouter();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setRecordId(resolvedParams.recordId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    const fetchCompleteData = async () => {
      if (!recordId) return;
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/patient/medical-records/view?recordId=${recordId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load file");
        }

        const data: Data = await response.json();

        setRecord(data.record);
        setSignedUrl(data.signedUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompleteData();
  }, [recordId]);

  const renderFileContent = () => {
    if (!signedUrl || !record) return null;

    const fileType = record.type.toLowerCase();
    const fileName = record.title.toLowerCase();

    // PDF File
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      
      return (
        <div className="w-full h-full flex flex-col">
          <div className="mb-2 flex gap-2">
            <a 
              href={signedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Open in New Tab
            </a>
            <a 
              href={signedUrl} 
              download
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Download
            </a>
          </div>
          <iframe
            src={signedUrl}
            className="w-full flex-1 border-0 rounded"
            title="PDF Viewer"
          />
        </div>
      );
    }

    // Image File
    if (
      fileType.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName)
    ) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded overflow-auto">
          <img
            src={signedUrl}
            alt={record.title}
            className="max-w-full max-h-full object-contain rounded shadow-lg"
          />
        </div>
      );
    }

    // Text File
    if (
      fileType.startsWith("text/") ||
      /\.(txt|csv|json|xml)$/i.test(fileName)
    ) {
      return (
        <iframe
          src={signedUrl}
          className="w-full h-full border border-gray-200 rounded"
          title="Text Viewer"
        />
      );
    }

    // Other files - use Google Docs viewer
    return (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}&embedded=true`}
        className="w-full h-full border-0 rounded"
        title="Document Viewer"
      />
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button variant="outline" size="icon" onClick={() => router.push("/patient/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold truncate">{record?.title}</h1>
            {record && (
              <p className="text-sm text-gray-500">
                {new Date(record.uploadDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
        <div className="w-full h-full">{renderFileContent()}</div>
      </div>
    </div>
  );
}