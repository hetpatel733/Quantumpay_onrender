// const alchemyDocs = require("@api/alchemy-docs"); // Removed as it was unused
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

// ----------------------------------
//      INITIALIZATION & SETUP
// ----------------------------------
const app = express();
const port = process.env.PORT || 8000;

// Connect to the database
require("./db/conn");

// Import all models ONCE in specific order to prevent conflicts
// Delete any duplicate lowercase model files first
try {
    require("./models/User");
    require("./models/model_Payment");
    require("./models/Order");
    require("./models/model_BusinessAPI");
    require("./models/PaymentConfiguration");
    require("./models/NotificationSettings");
    require("./models/Portfolio");
    require("./models/Notification");
    require("./models/DashboardDailyMetric");
    console.log('✅ All models loaded successfully');
} catch (error) {
    console.error('❌ Error loading models:', error.message);
    console.error('💡 Make sure to delete duplicate model files (order.js, businessAPI.js, payment.js)');
    process.exit(1);
}

// Add a debug endpoint to check payments
app.get("/api/debug/payments", async (req, res) => {
    try {
        const { Payment } = require('./models/model_Payment');
        const mongoose = require('mongoose');
        
        const totalPayments = await Payment.countDocuments({});
        const samplePayments = await Payment.find({}).limit(5).select('payId businessEmail status createdAt');
        
        res.json({
            totalPayments,
            samplePayments,
            collections: await mongoose.connection.db.listCollections().toArray()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentConfigRoutes = require('./routes/paymentConfigRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const validatePaymentRoutes = require('./routes/validatePaymentRoutes');
const notificationSettingsRoutes = require('./routes/notificationSettingsRoutes'); // <-- Add this line

// ----------------------------------
//      MIDDLEWARE CONFIGURATION
// ----------------------------------
// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000', // React dev server
        'http://localhost:9000',
        '13.228.225.19',
        '18.142.128.26',
        '54.254.162.138',
        'https://quantumpay-onrender.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight requests for all routes

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies
app.use(cookieParser()); // To parse cookies

// Serve static files for the React app
app.use(express.static(path.join(__dirname, "../../client/dist")));

// ----------------------------------
//         CORE & API ROUTES
// ----------------------------------
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString()
    });
});

// Root API route
app.get("/api", (req, res) => {
    res.send("Hello From QuantumPay Server - API is running!");
});

// API Route Groups
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-config', paymentConfigRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/notification-settings', notificationSettingsRoutes); // <-- Add this line

// Payment processing routes for customers (NO AUTHENTICATION REQUIRED) - Must come BEFORE the catch-all
app.use('/api/payment', validatePaymentRoutes);

// Legacy payment endpoint (for backward compatibility) (NO AUTHENTICATION REQUIRED)
app.post("/api/payment/coinselect", (req, res) => {
    const { CoinselectFunction } = require('./services/payment');
    CoinselectFunction(req, res);
});

// Add specific payment endpoints to ensure they work
app.get('/api/payment/payment-details', async (req, res) => {
    const { getPaymentDetails } = require('./services/payment');
    getPaymentDetails(req, res);
});

app.get('/api/payment/check-status', async (req, res) => {
    const { checkstatus } = require('./services/payment');
    checkstatus(req, res);
});

// Add missing paymentinfo endpoint for backward compatibility
app.get('/api/paymentinfo', async (req, res) => {
    const { paymentinfo } = require('./services/paymentinfo');
    paymentinfo(req, res);
});

// ----------------------------------
//         ERROR & CATCH-ALL
// ----------------------------------
// 404 handler for API routes (if no API route matches)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Catch-all handler: Forwards all other requests to the React app
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
});

// ----------------------------------
//          START SERVER
// ----------------------------------
app.listen(port, () => {
    console.log(`✅ QuantumPay Server running on http://localhost:${port}/`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
});