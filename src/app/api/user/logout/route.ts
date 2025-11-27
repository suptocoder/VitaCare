import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import redis from "@/lib/redis";
import { getCurrentUser } from "@/lib/user";

export async function POST() {
  try {

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    if (sessionToken) {

      await prisma.session.delete({
        where: { token: sessionToken },
      }).catch(() => {});
        
    
      response.cookies.delete("session_token");
      
    }

    return response;
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
