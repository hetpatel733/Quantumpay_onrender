const jwt = require("jsonwebtoken");
const { User } = require('../models/User');
const { BusinessAPI } = require('../models/model_BusinessAPI');

// Load secret from .env or use a fallback
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        // Get token from cookies, authorization header, or query parameter
        let token = req.cookies.token;
        
        // Try Authorization header if no cookie
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found or session expired. Please login again."
            });
        }

        // Set user on request object - ensure consistent ID format
        req.user = {
            id: user._id.toString(), // Convert ObjectId to string
            email: user.email,
            type: user.type || 'customer'
        };
        
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

// Add missing validateApiKey middleware
const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.body.api || req.query.api || req.headers['x-api-key'];
        
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required'
            });
        }

        // Find the API key in the database
        const apiKeyDoc = await BusinessAPI.findOne({ key: apiKey });
        
        if (!apiKeyDoc) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        if (!apiKeyDoc.isActive) {
            return res.status(403).json({
                success: false,
                message: 'API key is inactive',
                errorCode: 'API_PAUSED'
            });
        }

        // Attach API key info to request
        req.apiKey = apiKeyDoc;
        next();
    } catch (error) {
        console.error('API key validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during API key validation'
        });
    }
};

module.exports = {
    authenticateUser,
    validateApiKey
};
