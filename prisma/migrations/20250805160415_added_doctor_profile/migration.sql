-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "gender" "gender",
    "contact_number" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "qualification" TEXT[],
    "years_of_experience" INTEGER NOT NULL,
    "hospital_name" TEXT,
    "hospital_address" TEXT,
    "department_name" TEXT,
    "profile_picture_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_contact_number_key" ON "DoctorProfile"("contact_number");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_email_key" ON "DoctorProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_license_number_key" ON "DoctorProfile"("license_number");

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
