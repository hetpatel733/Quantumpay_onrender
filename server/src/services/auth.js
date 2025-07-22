const jwt = require("jsonwebtoken");
const { User } = require('../models/User');

// Load secret from .env or use a fallback
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        console.log("🔍 AUTH: Starting authentication middleware");
        
        // Get token from cookies, authorization header, or query parameter
        let token = req.cookies.token;
        
        // Try Authorization header if no cookie
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
            console.log("🔍 AUTH: Token found in Authorization header");
        } else if (token) {
            console.log("🔍 AUTH: Token found in cookies");
        }
        
        // Check if token exists
        if (!token) {
            console.log("❌ AUTH: No token found");
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        console.log("🔍 AUTH: Verifying token...");
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("✅ AUTH: Token verified, decoded:", { id: decoded.id, email: decoded.email });
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("❌ AUTH: User not found in database for ID:", decoded.id);
            return res.status(401).json({
                success: false,
                message: "User not found or session expired. Please login again."
            });
        }

        console.log("✅ AUTH: User found:", { id: user._id, email: user.email });

        // Set user on request object - ensure consistent ID format
        req.user = {
            id: user._id.toString(), // Convert ObjectId to string
            email: user.email,
            type: user.type || 'customer'
        };
        
        console.log("✅ AUTH: Request user set:", req.user);
        
        // Continue to route handler
        next();
    } catch (error) {
        console.error("❌ AUTH: Authentication error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Authentication error: " + error.message
        });
    }
};

module.exports = { authenticateUser };
