'use client'
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
function Header() {
  const router = useRouter()
const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/home')
  };

  return (
    <div>
      <header className="bg-white py-4 px-6 shadow-sm border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              VC
            </div>
            <h1 className="text-xl font-bold text-gray-900">VitaCare</h1>
          </div>
          {user ? (
            <div className="flex items-center space-x-4">
                <Button onClick={handleLogout} variant="ghost">Log Out</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default Header;
