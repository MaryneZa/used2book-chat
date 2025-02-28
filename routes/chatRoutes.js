const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");
const { routeAuth } = require("../middleware/auth");

const checkChatAccess = async (req, res, next) => {
    const userId = String(req.userId);
    const chatId = req.params.chatId || req.params.userId; // For /:chatId or /user/:userId

    try {
        // For /user/:userId, allow even if no chats exist (return empty list)
        if (req.path.startsWith("/user/")) {
            const chats = await ChatController.getUserChats(userId);
            if (chats.length === 0) {
                return res.json([]); // Return 200 OK with empty array
            }
            next();
            return;
        }

        // For /:chatId, ensure user is part of the chat
        if (!chatId.includes("-")) {
        
            return res.status(400).json({ error: "Invalid chatId format. Expected user1-user2." });
        }
        const [user1, user2] = chatId.split("-").map(id => String(id));
        if (user1 !== userId && user2 !== userId) {
            console.log("user1:", user1)
            console.log("userId:", userId)
            console.log("user2:", user2)
            console.log("user1:", typeof(user1))
            console.log("userId:", typeof(userId))
            console.log("user2:", typeof(user2))
            return res.status(403).json({ error: "Unauthorized access to chat" });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: "Failed to verify chat access" });
    }
};

router.post("/start", routeAuth, async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        if (!senderId || !receiverId) {
            return res.status(400).json({ error: "Missing senderId or receiverId" });
        }

        // Ensure senderId and receiverId are strings
        const sortedIds = [senderId, receiverId].sort();
        const chatId = `${sortedIds[0]}-${sortedIds[1]}`;
        console.log("Generated chatId:", chatId); // Log for debugging

        // Validate chatId format
        if (!chatId.includes("-")) {
            return res.status(400).json({ error: "Invalid chatId generated. Expected user1-user2 format." });
        }

        // Check if chat exists
        const existingMessages = await ChatController.getChatMessages(chatId);
        if (existingMessages.length > 0) {
            return res.json({ chatId });
        }

        // Save initial message
        const initialMessage = {
            senderId,
            receiverId,
            content: "Chat started",
            chatId,
        };
        const savedMessage = await ChatController.saveMessage(initialMessage);

        if (savedMessage) {
            res.status(201).json({ chatId });
        } else {
            res.status(500).json({ error: "Failed to start chat" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error starting chat" });
    }
});

// Existing routes...
router.get("/:chatId", routeAuth, checkChatAccess, async (req, res) => {
    try {
        console.log("Fetching messages for chatId:", req.params.chatId);
        const messages = await ChatController.getChatMessages(req.params.chatId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

router.get("/user/:userId", routeAuth, checkChatAccess, async (req, res) => {
    try {
        console.log("Fetching chats for userId:", req.params.userId);
        const chats = await ChatController.getUserChats(req.params.userId);
        res.json(chats || []);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chats" });
    }
});

module.exports = router;