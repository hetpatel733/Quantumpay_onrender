const { loginlog, accounts } = require("../models/account");
const jwt = require("jsonwebtoken");

// Load secret from .env or use a fallback
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const login = async (req, res) => {
    try {
        console.log("🔍 REQUEST RECEIVED: Login attempt for email:", req.body.email);

        const { email, password } = req.body;

        // Check if email exists
        const user = await accounts.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            console.log("📤 RESPONSE SENT: User not found - Status: 401");
            return res.status(401).json({
                success: false,
                message: "Email not found. Please check your email or sign up."
            });
        }

        // Check if password matches
        if (user.password !== password) {
            console.log("Password mismatch for user:", email);
            console.log("📤 RESPONSE SENT: Password mismatch - Status: 401");
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please try again."
            });
        }

        console.log("User authenticated successfully:", email);

        // Generate token
        const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, {
            expiresIn: '7d' // token expires in 7 days
        });

        // Optional: Save token in DB if you want session tracking
        user.token = token;
        await user.save();

        // Set cookies with correct security settings
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'none',
            path: '/'
        });

        // Set a non-httpOnly cookie for JS access (as a fallback)
        res.cookie('auth_token', token, {
            httpOnly: false,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'none',
            path: '/'
        });

        const responseData = {
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                email: user.email
            }
        };

        console.log("📤 RESPONSE SENT: Login successful - Status: 200");
        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Login Error:", error);
        console.log("📤 RESPONSE SENT: Internal server error - Status: 500");
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later."
        });
    }
};

const validateToken = async (req, res) => {
    try {
        console.log("🔍 REQUEST RECEIVED: Token validation");
        
        // Try to get token from cookies first, then authorization header
        const token = req.cookies.token ||
            (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
                ? req.headers.authorization.substring(7) : null);

        if (!token) {
            console.log("📤 RESPONSE SENT: No token found - Status: 401");
            return res.status(401).json({
                success: false,
                message: "No authentication token found"
            });
        }

        // Verify JWT token - this is fast and doesn't require DB access
        const decoded = jwt.verify(token, JWT_SECRET);

        console.log("📤 RESPONSE SENT: Token validation successful - Status: 200");
        // Skip full DB lookup for better performance - just verify the token is valid
        // Only do a lightweight check instead of pulling the entire user record
        return res.status(200).json({
            success: true,
            message: "Authentication valid",
            user: {
                id: decoded.id,
                email: decoded.email
            }
        });

    } catch (error) {
        console.error("Token validation error:", error);

        if (error.name === 'JsonWebTokenError') {
            console.log("📤 RESPONSE SENT: Invalid token - Status: 401");
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        } else if (error.name === 'TokenExpiredError') {
            console.log("📤 RESPONSE SENT: Token expired - Status: 401");
            return res.status(401).json({
                success: false,
                message: "Token expired - please login again"
            });
        }

        console.log("📤 RESPONSE SENT: Token validation failed - Status: 500");
        return res.status(500).json({
            success: false,
            message: "Token validation failed"
        });
    }
};

const getUserData = async (req, res) => {
    try {
        console.log("🔍 REQUEST RECEIVED: Get user data for ID:", req.query.id);
        console.log("Full query object:", req.query);
        console.log("Request method:", req.method);
        console.log("Request URL:", req.url);
        
        const { id } = req.query;
        
        if (!id) {
            console.log("📤 RESPONSE SENT: User ID required - Status: 400");
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Validate that id is a valid MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log("📤 RESPONSE SENT: Invalid user ID format - Status: 400");
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        // Find user in database with complete information
        const user = await accounts.findById(id).select('-password -token'); // Exclude sensitive fields
        if (!user) {
            console.log("📤 RESPONSE SENT: User not found - Status: 404");
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log("User data fetched successfully for ID:", id);
        console.log("📤 RESPONSE SENT: User data retrieved - Status: 200");

        return res.status(200).json({
            success: true,
            message: "User data retrieved successfully",
            userData: {
                id: user._id,
                email: user.email,
                uname: user.uname || user.name || 'User',
                type: user.type || 'personal',
                verified: user.verified || false,
                name: user.name || user.uname || 'User',
                businessName: user.businessName || user.uname || 'User Business',
                phone: user.phone || '',
                website: user.website || '',
                businessType: user.businessType || 'E-commerce',
                country: user.country || 'United States',
                timezone: user.timezone || 'America/New_York'
            }
        });

    } catch (error) {
        console.error("Get user data error:", error);
        console.log("📤 RESPONSE SENT: Failed to retrieve user data - Status: 500");
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user data: " + error.message
        });
    }
};

module.exports = {
    login,
    validateToken,
    getUserData
};