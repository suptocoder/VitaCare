"use client";
import AccessRequests from "@/components/ui/AccessRequests";
import ActiveDoctorAccess from "@/components/ui/ActiveDoctorAccess";
import FileAccessRequests from "@/components/ui/FileAccessRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccessLog() {
  return (
    <div>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <AccessRequests />
        </TabsContent>
        <TabsContent value="active">
          <ActiveDoctorAccess />
        </TabsContent>
        <TabsContent value="files">
          <FileAccessRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
