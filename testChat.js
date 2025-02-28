const io = require("socket.io-client");
const readline = require("readline");

// Replace with your server's URL (e.g., if running locally on port 5000)
const SOCKET_URL = "http://localhost:5000";

// Connect to the WebSocket server
const socket = io(SOCKET_URL, {
    transports: ["websocket"], // Use WebSocket transport
    reconnection: true // Automatically reconnect if disconnected
});

// Set up readline for terminal input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Simulate two users (for testing)
const userId = process.argv[2] || "user1"; // Pass user ID via command line, default to "user1"
const receiverId = userId === "user1" ? "user2" : "user1"; // Simple toggle for testing

// Handle connection
socket.on("connect", () => {
    console.log(`Connected to server as ${userId} (Socket ID: ${socket.id})`);
    socket.emit("join", userId);
    console.log(`Type a message to send to ${receiverId}. Press Ctrl+C to exit.`);
    startChat();
});

// Handle incoming messages
socket.on("receiveMessage", (message) => {
    console.log(`\n[Received from ${message.senderId}]: ${message.content}`);
    console.log(`(Timestamp: ${new Date(message.timestamp).toLocaleTimeString()})`);
    rl.prompt(); // Show prompt again after receiving a message
});

// Handle errors
socket.on("error", (errorMsg) => {
    console.error(`Error: ${errorMsg}`);
    rl.prompt();
});

// Handle disconnection
socket.on("disconnect", () => {
    console.log("Disconnected from server");
    rl.close();
});

// Function to start chatting
function startChat() {
    rl.setPrompt(`[${userId} to ${receiverId}]> `);
    rl.prompt();

    rl.on("line", (input) => {
        if (input.trim()) {
            const message = {
                senderId: userId,
                receiverId: receiverId,
                content: input.trim()
            };
            socket.emit("sendMessage", message);
            console.log(`[Sent]: ${message.content}`);
        }
        rl.prompt();
    });

    rl.on("close", () => {
        console.log("Exiting chat...");
        socket.disconnect();
        process.exit(0);
    });
}

// Handle connection errors
socket.on("connect_error", (error) => {
    console.error("Connection error:", error.message);
});