"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Data } from "@/app/view-record/[recordId]/page";
import {MedicalRecord} from "@/generated/prisma";
interface DirectViewerProps {
  params: Promise<{ recordId: string }>;
}


export default function DirectViewer({ params }: DirectViewerProps) {

  const router = useRouter();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  
  const closeModal = () => {
    console.log("🔙 Closing modal");
    router.back();
  };

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
   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderFileContent = () => {
    if (!signedUrl || !record) return null;

    const fileType = record.type.toLowerCase();
    const fileName = record.title.toLowerCase();

    // we check if PDF File
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return (
        <iframe
          src={`${signedUrl}`}
          className="w-full h-full border-0 rounded"
          title="PDF Viewer"
        />
      );
    }


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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

   return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-[95vw] h-[95vh] max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
    
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-semibold truncate">
              {record?.title || "Medical Record"}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={closeModal}
            className="h-9 w-9 hover:bg-gray-100"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading file...</p>
              </div>
            </div>
          )}
              {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load File</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button onClick={closeModal} variant="outline">Close</Button>
              </div>
            </div>
          )}

          {record && !loading && !error && (
            <div className="w-full h-full">
              {renderFileContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


