const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const ChatController = require("./controllers/chatController");
const { socketAuth } = require("./middleware/auth");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = ["http://localhost:3000"];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
};

app.use(cors(corsOptions));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
});

connectDB();
app.use(express.json());
app.use("/chat", chatRoutes);

io.use(socketAuth);

io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected (Socket ID: ${socket.id})`);
    // socket.join(socket.userId);

    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
      });

    socket.on("sendMessage", async (data) => {
        const { receiverId, content, chatId } = data;
        const senderId = socket.userId;

        if (!receiverId || !content || !chatId) {
            socket.emit("error", "Missing required fields");
            return;
        }

        const message = { senderId, receiverId, content, chatId };
        const savedMessage = await ChatController.saveMessage(message);

        if (savedMessage) {
            // io.to(receiverId).emit("receiveMessage", savedMessage);
            // socket.emit("messageSent", savedMessage);
            io.to(chatId).emit("receiveMessage", savedMessage);

            io.to(receiverId).emit("receiveMessage", savedMessage);
            console.log(`Emitted receiveMessage to ${receiverId} for chatId ${savedMessage.chatId}`);
            // socket.emit("messageSent", savedMessage);
            console.log(`Emitted messageSent to ${socket.userId} for chatId ${savedMessage.chatId}`);
        } else {
            socket.emit("error", "Failed to save message");
        }
    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
    });
});

const PORT = process.env.CHAT_PORT || process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Chat Service running on port ${PORT}`));