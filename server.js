// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Allow all origins (for APK users)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Optional: test route
app.get("/", (req, res) => {
  res.send("Chat server is running 🚀");
});

// Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Receive message from any user
  socket.on("send_message", (message) => {
    console.log("Message:", message);

    // Send message to all users
    io.emit("receive_message", message);
  });

  // User disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Use PORT from cloud or default 5000
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
