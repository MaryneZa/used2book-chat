const Message = require("../models/messageModel");

exports.saveMessage = async (data) => {
    try {
        const { senderId, receiverId, content, chatId } = data;
        if (!senderId || !receiverId || !content || !chatId) {
            console.error("Missing required fields");
            return null;
        }

        const message = new Message({ senderId, receiverId, content, chatId });
        const savedMessage = await message.save();
        console.log("Message saved:", savedMessage);
        return savedMessage;
    } catch (error) {
        console.error("Error saving message:", error.message);
        return null;
    }
};

exports.getChatMessages = async (chatId) => {
    try {
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
        return messages;
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        throw error;
    }
};

exports.getUserChats = async (userId) => {
    try {
        const conversations = await Message.aggregate([
            // Match all messages involving the user (sender or receiver)
            { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
            // Sort all messages by timestamp descending to get the latest
            { $sort: { timestamp: -1 } },
            // Group by chatId and get the first (most recent) message after sorting
            {
                $group: {
                    _id: "$chatId",
                    lastMessage: { $first: "$$ROOT" } // Use $first instead of $last after sorting
                }
            },
            // Sort chats by the latest message timestamp
            { $sort: { "lastMessage.timestamp": -1 } }
        ]);
        return conversations;
    } catch (error) {
        console.error("Error fetching chats:", error.message);
        throw error;
    }
};