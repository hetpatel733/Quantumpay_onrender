const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
    businessEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        ref: 'User'
    },
    emailNotifications: {
        paymentReceived: {
            type: Boolean,
            default: false
        },
        paymentFailed: {
            type: Boolean,
            default: false
        },
        dailySummary: {
            type: Boolean,
            default: false
        },
        weeklySummary: {
            type: Boolean,
            default: false
        },
        securityAlerts: {
            type: Boolean,
            default: false
        },
        systemUpdates: {
            type: Boolean,
            default: false
        },
        marketingEmails: {
            type: Boolean,
            default: false
        }
    },
    pushNotifications: {
        enabled: {
            type: Boolean,
            default: false
        },
        paymentAlerts: {
            type: Boolean,
            default: false
        },
        securityAlerts: {
            type: Boolean,
            default: false
        },
        systemAlerts: {
            type: Boolean,
            default: false
        }
    }
}, { 
    timestamps: true 
});

// Add indexes for performance
notificationSettingsSchema.index({ businessEmail: 1 });

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = { NotificationSettings };
