const io = require("socket.io-client");

const socket = io("http://localhost:5000", {
    transports: ["websocket"], // Use WebSocket only (no polling fallback)
    reconnection: true, // Automatically reconnect if disconnected
});

socket.on("connect", () => {
    console.log("✅ Connected to WebSocket Server!");
    socket.emit("sendMessage", { senderId: "user1", receiverId: "user2", content: "Hello!" });
});

socket.on("receiveMessage", (data) => {
    console.log("📩 Message received:", data);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection Error:", err.message);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from WebSocket Server");
});