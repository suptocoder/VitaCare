interface NotificationPayload {
  type:
    | "ACCESS_REQUESTED"
    | "ACCESS_APPROVED"
    | "ACCESS_DENIED"
    | "ACCESS_REVOKED";
  message: string;
  data?: any;
}

export function sendNotificationtoUser(userId: string, payload: NotificationPayload){
 try {
    const io = (global as any).io;
    const connectedUsers = (global as any).connectedUsers;

    if (!io || !connectedUsers) {
      console.warn("⚠️ WebSocket server not initialized");
      return false;
    }

    const socketId = connectedUsers.get(userId);

    if (socketId) {

      io.to(socketId).emit("notification", payload);
      console.log(`Notification sent to user ${userId}`);
      return true;
    } else {
      console.log(`User ${userId} is not online`);
      return false;
    }
  } catch (error) {
    console.error("Error sending WebSocket notification:", error);
    return false;
  }
}
