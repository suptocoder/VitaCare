import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";
import { cookies } from "next/headers";

export async function GET() {
  try {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get("session_token")?.value;
      if(!sessionToken){
        return NextResponse.json({ user: null }, { status: 401 });
      }
    const user = await getCurrentUser();
    if(user==null){
        return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
