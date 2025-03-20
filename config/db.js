const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://chat_user:chat_password@localhost:27017/chat_db?authSource=admin"; // Fallback for local dev
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully !!");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1); // Exit process if DB connection fails
    }
};

module.exports = connectDB;
//  const mongoose = require("mongoose");

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("MongoDB connected successfully !!");
//     } catch (error) {
//         console.error("MongoDB connection error:", error.message);
//         process.exit(1); // Exit process if DB connection fails
//     }
// };

// module.exports = connectDB;

