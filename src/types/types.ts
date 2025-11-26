export interface User {
 id: string;
 fullName: string;
 contactNumber: string | null;
 role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
 patientuuid?: string;
 profilePictureUrl?: string | null;
 BloodGroup?: string;
 dateOfBirth?: Date | null;
 gender?: string | null;
 address?: string | null;
}