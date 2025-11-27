import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/lib/user";

const f = createUploadthing();

export const ourFileRouter = {
  medicalRecordUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // UploadThing middleware - just allow upload, auth will be checked when creating DB record
      console.log("UploadThing middleware - allowing upload");
      return { uploadedAt: Date.now() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete at:", metadata.uploadedAt);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
