const { login, validateToken, getUserData } = require('./login');
const { signup } = require('./signup');
const { contact } = require('./contact');
const {
    paymentFunction,
    CoinselectFunction,
    FinalpayFunction,
    checkstatus,
    getPaymentDetails,
    validatePaymentRequest
} = require("./payment");
const { authenticateUser } = require('./auth');
const { paymentinfo } = require('./paymentinfo');
const { User } = require("../models/User");
const { NotificationSettings } = require("../models/NotificationSettings");
const { createNotification, createPaymentNotification } = require('./notificationService');

// Add updateUser service
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        
        // Remove any potentially harmful fields that could affect order status
        delete updateData.orders;
        delete updateData.orderStatus;
        delete updateData.completedOrders;
        
        // Validate user ID format
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID format"
            });
        }

        // Find and update user
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-passwordHash -token');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile: " + error.message
        });
    }
};

// Add notification settings utilities
const getNotificationSettings = async (req, res) => {
    try {
        let settings = await NotificationSettings.findOne({
            businessEmail: req.user.email
        });

        // If no settings exist, create default ones
        if (!settings) {
            settings = new NotificationSettings({
                businessEmail: req.user.email,
                emailNotifications: {
                    paymentReceived: false,
                    paymentFailed: false,
                    dailySummary: false,
                    weeklySummary: false,
                    securityAlerts: false,
                    systemUpdates: false,
                    marketingEmails: false
                },
                pushNotifications: {
                    enabled: false,
                    paymentAlerts: false,
                    securityAlerts: false,
                    systemAlerts: false
                }
            });

            await settings.save();
        }

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get notification settings: " + error.message
        });
    }
};

const updateNotificationSettings = async (req, res) => {
    try {
        const { emailNotifications, pushNotifications } = req.body;

        let settings = await NotificationSettings.findOne({
            businessEmail: req.user.email
        });

        if (!settings) {
            // Create new settings if they don't exist
            settings = new NotificationSettings({
                businessEmail: req.user.email,
                emailNotifications: emailNotifications || {},
                pushNotifications: pushNotifications || {}
            });
        } else {
            // Update existing settings
            if (emailNotifications) {
                settings.emailNotifications = {
                    ...settings.emailNotifications,
                    ...emailNotifications
                };
            }
            
            if (pushNotifications) {
                settings.pushNotifications = {
                    ...settings.pushNotifications,
                    ...pushNotifications
                };
            }
        }

        await settings.save();

        return res.status(200).json({
            success: true,
            settings,
            message: 'Notification settings updated successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update notification settings: " + error.message
        });
    }
};

module.exports = {
    login, 
    validateToken, 
    getUserData, 
    signup, 
    contact,
    paymentFunction,
    CoinselectFunction,
    FinalpayFunction,
    checkstatus,
    getPaymentDetails,
    validatePaymentRequest,
    authenticateUser, 
    paymentinfo,
    updateUser,
    createNotification,
    createPaymentNotification,
    getNotificationSettings,
    updateNotificationSettings
};