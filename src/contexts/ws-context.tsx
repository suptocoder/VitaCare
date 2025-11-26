"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children,userId }: { children: React.ReactNode,userId :string}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const socketInstance = io("http://localhost:3001", {
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
       socketInstance.emit("authenticate", userId);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("notification", (data) => {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications }}>
      {children}
    </SocketContext.Provider>
    )
}