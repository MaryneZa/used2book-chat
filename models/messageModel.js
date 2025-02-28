const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: { 
        type: String, 
        required: [true, "Sender ID is required"], 
        index: true 
    },
    receiverId: { 
        type: String, 
        required: [true, "Receiver ID is required"], 
        index: true 
    },
    content: { 
        type: String, 
        required: [true, "Message content is required"], 
        trim: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    chatId: { 
        type: String, 
        required: true, 
        index: true // For quick lookup by conversation
    }
});

module.exports = mongoose.model("Message", messageSchema);