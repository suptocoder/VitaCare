"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/types";
import { usePathname } from "next/navigation";
interface AuthContextType {
  user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;

}
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();
const login = async () => {
  try {
    const response = await fetch("/api/user/current");
    const data = await response.json();
  
    if(data.status === 401){
      setUser(null)
    }
    setUser(data.user || null);
  } catch (error) {
    console.error("Login error:", error);
    setUser(null);
  }
};
  
  const logout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    setUser(null);
  };

  const isAuthenticated = !!user;

  useEffect(() => {
     const publicRoutes = ["/auth/login", "/auth/verify", "/home", "/"];

     
     if (publicRoutes.includes(pathname)) {
       setUser(null);
       return;
     }
    login(); 
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
