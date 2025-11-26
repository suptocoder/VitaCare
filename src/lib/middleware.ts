import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "./user";

export async function middleware(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  

  // If there's no session token and the user is trying to access a protected route
  if (!sessionToken && req.nextUrl.pathname.startsWith("/patient")) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is logged in and tries to access auth pages, redirect to dashboard
  if (sessionToken && req.nextUrl.pathname.startsWith("/auth")) {
    const dashboardUrl = new URL("/patient/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }
  //User is logged in and trying to access authorized route
//   if(sessionToken && req.nextUrl.pathname.startsWith("patient")){
//    const user = await getCurrentUser();
//    if(!user){
//     const loginUrl = new URL("/auth/login", req.url);
//     return NextResponse.redirect(loginUrl);
//    }
//   }

  return NextResponse.next();
}

export const config = {

  matcher: ["/patient/dashboard/:path*", "/auth/:path*"],
};
