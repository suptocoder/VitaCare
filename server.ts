import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";

// ✅ DEFINE TYPES FOR GLOBAL VARIABLES
// This prevents TypeScript errors when assigning to `global`
declare global {
  var io: Server | undefined;
  var connectedUsers: Map<string, string>;
}

// ✅ EXTEND SOCKET TYPE
// This allows us to attach 'userId' to the socket object safely
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {

  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        if (!req.url) return;
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    }
  );

  // ✅ CREATE WEBSOCKET SERVER
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // ✅ STORE WHO'S ONLINE
  // Typescript Map<KeyType, ValueType>
  const connectedUsers = new Map<string, string>();

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log("Client connected:", socket.id);

    // When user logs in, they send their userId
    socket.on("authenticate", (userId: string) => {
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
      connectedUsers.set(userId, socket.id);
      socket.userId = userId; // Store on socket for cleanup
    });

    socket.on("disconnect", () => {
      console.log(" Client disconnected:", socket.id);
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });


  global.io = io;
  global.connectedUsers = connectedUsers;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server is running`);
    });
});
