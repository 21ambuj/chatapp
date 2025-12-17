const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// ✅ Enable CORS for Android + Web
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

// ✅ Health check (Render needs this)
app.get("/", (req, res) => {
  res.send("✅ Socket.IO Chat Server Running");
});

const server = http.createServer(app);

// ✅ Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ Store connected users
const users = {};

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Optional: user joins with name
  socket.on("join", (username) => {
    users[socket.id] = username || "Anonymous";
    console.log(`👤 ${users[socket.id]} joined`);
  });

  // ✅ Receive message from client
  socket.on("send_message", (message) => {
    try {
      if (!message || typeof message !== "string") {
        console.log("⚠️ Invalid message ignored");
        return;
      }

      const payload = {
        sender: users[socket.id] || "Unknown",
        message: message,
        time: new Date().toISOString()
      };

      console.log("📩 Message:", payload);

      // 🔥 Send to all OTHER clients
      socket.broadcast.emit("receive_message", payload);

    } catch (err) {
      console.error("❌ Error handling message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    delete users[socket.id];
  });
});

// ✅ Render requires PORT from env
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
