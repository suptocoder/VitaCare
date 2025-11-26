

import { MedicalRecord } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "./button";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";

interface PatientRecordsProps {
  medicalRecords: MedicalRecord[];
  setRecords?: React.Dispatch<React.SetStateAction<MedicalRecord[]>>;
  readOnly?: boolean;
}

function PatientRecords({ medicalRecords, setRecords, readOnly = false }: PatientRecordsProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  if (!medicalRecords || medicalRecords.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No medical records have been uploaded yet.
      </p>
    );
  }

  const handleVisibility = async(record: MedicalRecord) => {
    if (!setRecords || readOnly) return;
    
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id ? { ...r, isHidden: !r.isHidden } : r
      )
    );
    const res = fetch("/api/patient/medical-records/tooglevisibilty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recordId: record.id,
      }),
    });
    const response = (await res).json()
    console.log("VIsibility",res)
  }

  const handleDelete = async (record: MedicalRecord) => {
    if (readOnly || !setRecords) return;
    
    if (!confirm(`Delete "${record.title}"?`)) {
      return;
    }

    // Optimistic update - remove immediately from UI
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
    setDeletingId(record.id);

    try {
      const res = await fetch("/api/patient/medical-records/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.id }),
      });

      if (!res.ok) {
        // Rollback on error
        const data = await res.json();
        setRecords((prev) => [...prev, record].sort((a, b) => 
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        ));
        alert(data.error || "Failed to delete record");
      }
    } catch (error) {
      // Rollback on error
      console.error("Delete error:", error);
      setRecords((prev) => [...prev, record].sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      ));
      alert("Failed to delete record");
    } finally {
      setDeletingId(null);
    }
  } 

   return (
     <div className="space-y-3 p-1">
       {medicalRecords.map((record) => {
         const isVisible = !record.isHidden;
         function handleViewRecord(record: MedicalRecord) {
            console.log('Navigating to:', `/view-record/${record.id}`);
            router.push(`/view-record/${record.id}`);
         }

         return (
           <div
             key={record.id}
             className="w-full p-4 border rounded-lg flex items-center justify-between transition-all hover:shadow-md hover:border-primary/50"
           >
             <div 
               onClick={() => handleViewRecord(record)}
               className="flex-grow truncate pr-4 cursor-pointer"
             >
               <p className="font-semibold truncate">{record.title}</p>
               <p className="text-sm text-gray-500">
                 Uploaded: {format(new Date(record.uploadDate), "PPP")}
               </p>
             </div>
             {!readOnly && (
               <button
                 onClick={(e) => {
                   e.preventDefault();
                   console.log("toogling");
                   handleVisibility(record);
                 }}
                 className="flex items-center gap-2 flex-shrink-0 cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100"
               >
                 <span
               
               className={cn(
                     "h-2.5 w-2.5 rounded-full",
                     isVisible ? "bg-green-500" : "bg-red-500"
                   )}
                 />
                 <span className="text-sm font-medium">
                   {isVisible ? "Visible" : "Hidden"}
                 </span>
               </button>
             )}

             <div className="flex gap-2">
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleViewRecord(record)}
                 className="h-6 px-2 text-xs"
               >
                 <Eye className="h-3 w-3 mr-1" />
                 View
               </Button>
               {!readOnly && (
                 <Button
                   size="sm"
                   variant="destructive"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDelete(record);
                   }}
                   disabled={deletingId === record.id}
                   className="h-6 px-2 text-xs"
                 >
                   <Trash2 className="h-3 w-3" />
                 </Button>
               )}
             </div>
           </div>
         );
       })}
     </div>
   );
}

export default PatientRecords;
