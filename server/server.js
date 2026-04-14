import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

const rooms = {};
const userSessions = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: {},
        drawingHistory: [],
      };
    }

    rooms[roomId].users[userId] = {
      id: userId,
      socketId: socket.id,
    };

    userSessions[socket.id] = { roomId, userId };

    // Notify others that user joined
    socket.to(roomId).emit("user-joined", {
      userId,
      userCount: Object.keys(rooms[roomId].users).length,
    });

    // Send current users to the new user
    socket.emit("room-users", {
      users: Object.keys(rooms[roomId].users),
      userCount: Object.keys(rooms[roomId].users).length,
    });

    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Handle drawing events
  socket.on("draw-start", (data) => {
    const session = userSessions[socket.id];
    if (session) {
      io.to(session.roomId).emit("draw", {
        ...data,
        type: "start",
      });
      rooms[session.roomId].drawingHistory.push({
        ...data,
        type: "start",
      });
    }
  });

  socket.on("draw-line", (data) => {
    const session = userSessions[socket.id];
    if (session) {
      io.to(session.roomId).emit("draw", {
        ...data,
        type: "line",
      });
      rooms[session.roomId].drawingHistory.push({
        ...data,
        type: "line",
      });
    }
  });

  socket.on("draw-end", (data) => {
    const session = userSessions[socket.id];
    if (session) {
      io.to(session.roomId).emit("draw", {
        ...data,
        type: "end",
      });
      rooms[session.roomId].drawingHistory.push({
        ...data,
        type: "end",
      });
    }
  });

  socket.on("clear-canvas", () => {
    const session = userSessions[socket.id];
    if (session) {
      io.to(session.roomId).emit("canvas-cleared");
      rooms[session.roomId].drawingHistory = [];
    }
  });

  socket.on("disconnect", () => {
    const session = userSessions[socket.id];
    if (session) {
      const { roomId, userId } = session;

      io.to(roomId).emit("user-left", {
        userId,
        userCount: Object.keys(rooms[roomId].users).length - 1,
      });

      delete rooms[roomId].users[userId];

      if (Object.keys(rooms[roomId].users).length === 0) {
        delete rooms[roomId];
      }

      console.log(`User ${userId} left room ${roomId}`);
    }

    delete userSessions[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n✨ Whiteboard server running on port ${PORT}`);
  console.log(`🚀 WebSocket server ready for connections\n`);
});
