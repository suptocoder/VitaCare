import { getCurrentUser } from "@/lib/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req:NextRequest){
    try{ const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const {recordId} = await req.json();
    const MedicalRecord = await prisma?.medicalRecord.findFirst({
        where: {
            id:recordId,
            patientId:currentUser.id
        }

    })
    if(MedicalRecord){
        const updatedRecord = await prisma?.medicalRecord.update({
            where: {
                id:recordId
            },
            data:{
                isHidden: !MedicalRecord.isHidden
            }
        })
        return NextResponse.json({message:"Visibility toggled successfully", record: updatedRecord}, {status:200});
    }
 else {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });   
 }
}catch(error){
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}