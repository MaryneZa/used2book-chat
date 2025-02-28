const axios = require("axios");

const verifyToken = async (token) => {
    if (!token) throw new Error("No token provided");
    try {
        const response = await axios.post(
            "http://localhost:6951/auth/verify-token",
            { token },
            { headers: { "Content-Type": "application/json" } }
        );
        return response.data.user_id;
    } catch (error) {
        console.error("Token verification error:", error.response?.data || error.message);
        throw new Error("Invalid token");
    }
};

// Socket.IO middleware
const socketAuth = async (socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("Socket.IO token:", token);
    try {
        const userId = await verifyToken(token);
        socket.userId = userId;
        console.log("Socket.IO verified user_id:", userId);
        next();
    } catch (error) {
        next(error);
    }
};

// Express middleware
const routeAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    // console.log("Route token:", token);
    try {
        const userId = await verifyToken(token);
        req.userId = userId;
        console.log("Route verified user_id:", userId);
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = { socketAuth, routeAuth };