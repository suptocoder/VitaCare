import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/lib/user";

const f = createUploadthing();

export const ourFileRouter = {
  medicalRecordUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      try {
        const user = await getCurrentUser();
        console.log("UploadThing middleware - user:", user?.id);
        if (!user) throw new Error("Unauthorized - no user found");
        return { userId: user.id };
      } catch (error) {
        console.error("UploadThing middleware error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
