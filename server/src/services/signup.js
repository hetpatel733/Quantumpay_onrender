const { User } = require("../models/User");
const { PaymentConfiguration } = require("../models/PaymentConfiguration");
const { Notification } = require("../models/Notification");
const { NotificationSettings } = require("../models/NotificationSettings");
const { BusinessAPI } = require("../models/BusinessAPI");
const { DashboardDailyMetric } = require("../models/DashboardDailyMetric");
const crypto = require('crypto');
const { initializeBusinessMetrics } = require('./dashboardMetricsService');

// Function to create default payment configurations for business users
const createDefaultPaymentConfigurations = async (businessEmail) => {
    try {
        const defaultCryptoConfigs = [
            {
                coinType: 'USDT',
                enabled: false,
                address: '',
                label: 'USDT Configuration',
                network: 'Polygon',
                isDefault: false
            },
            {
                coinType: 'PYUSD',
                enabled: false,
                address: '',
                label: 'PayPal USD Configuration',
                network: 'Polygon',
                isDefault: false
            },
            {
                coinType: 'BTC',
                enabled: false,
                address: '',
                label: 'Bitcoin Configuration',
                network: 'Bitcoin',
                isDefault: false
            },
            {
                coinType: 'ETH',
                enabled: false,
                address: '',
                label: 'Ethereum Configuration',
                network: 'Ethereum',
                isDefault: false
            },
            {
                coinType: 'MATIC',
                enabled: false,
                address: '',
                label: 'Polygon Native Token',
                network: 'Polygon',
                isDefault: false
            }
        ];

        const paymentConfig = new PaymentConfiguration({
            businessEmail,
            cryptoConfigurations: defaultCryptoConfigs,
            conversionSettings: {
                autoConvert: false,
                baseCurrency: 'USD',
                conversionRate: 'real-time',
                slippageTolerance: 1.0
            },
            transactionLimits: {
                minAmount: 10,
                maxAmount: 50000,
                dailyLimit: 100000,
                monthlyLimit: 1000000
            }
        });

        await paymentConfig.save();
        console.log('✅ Default payment configuration created for:', businessEmail);
    } catch (error) {
        console.error('❌ Error creating default payment configuration:', error);
        // Don't throw error to prevent signup failure
    }
};

// Function to create welcome notification for any user
const createWelcomeNotification = async (businessEmail, userType) => {
    try {
        const message = userType === 'business' 
            ? 'Welcome to QuantumPay! Your business account has been successfully created. Start by configuring your payment settings and creating your first order.'
            : 'Welcome to QuantumPay! Your personal account has been successfully created. Explore our cryptocurrency payment solutions.';

        // Check if notification document exists for this user
        let userNotifications = await Notification.findOne({ businessEmail });
        
        if (!userNotifications) {
            // Create new notification document
            userNotifications = new Notification({
                businessEmail,
                notifications: [],
                unreadCount: 0
            });
        }

        // Add welcome notification
        await userNotifications.addNotification({
            message,
            orderId: 'SYSTEM-WELCOME',
            type: 'welcome',
            isRead: false,
            priority: 'high',
            metadata: {
                source: 'system',
                action: 'signup_complete',
                userType
            }
        });

        console.log('✅ Welcome notification created for:', businessEmail);
        return userNotifications;
    } catch (error) {
        console.error('❌ Error creating welcome notification:', error);
        console.error('Error details:', error.message);
        // Don't throw error to prevent signup failure
        return null;
    }
};

// Function to create additional setup notifications for business users
const createSetupNotifications = async (businessEmail) => {
    try {
        let userNotifications = await Notification.findOne({ businessEmail });
        
        if (!userNotifications) {
            userNotifications = new Notification({
                businessEmail,
                notifications: [],
                unreadCount: 0
            });
        }

        const setupNotificationData = [
            {
                message: 'Next step: Configure your cryptocurrency wallet addresses to start accepting payments.',
                orderId: 'SYSTEM-SETUP-CONFIG',
                type: 'system',
                isRead: false,
                priority: 'medium',
                metadata: {
                    source: 'system',
                    action: 'setup_payment_config'
                }
            },
            {
                message: 'Generate API keys to integrate QuantumPay with your website or application.',
                orderId: 'SYSTEM-SETUP-API',
                type: 'system',
                isRead: false,
                priority: 'medium',
                metadata: {
                    source: 'system',
                    action: 'setup_api_keys'
                }
            }
        ];

        for (const notificationData of setupNotificationData) {
            await userNotifications.addNotification(notificationData);
        }
        
        console.log('✅ All setup notifications created for:', businessEmail);
    } catch (error) {
        console.error('❌ Error creating setup notifications:', error);
        // Don't throw error to prevent signup failure
    }
};

// Function to create default notification settings for any user
const createDefaultNotificationSettings = async (businessEmail) => {
    try {
        const notificationSettings = new NotificationSettings({
            businessEmail,
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

        await notificationSettings.save();
        console.log('✅ Default notification settings created for:', businessEmail);
    } catch (error) {
        console.error('❌ Error creating default notification settings:', error);
        // Don't throw error to prevent signup failure
    }
};

// Function to create default API key for business users
const createDefaultApiKey = async (businessEmail) => {
    try {
        // Generate unique API key and secret
        const apiKey = `qp_${crypto.randomBytes(16).toString('hex')}`;
        const apiSecret = `qpsec_${crypto.randomBytes(32).toString('hex')}`;

        const defaultApiKey = new BusinessAPI({
            businessEmail,
            label: 'Default API Key',
            key: apiKey,
            secret: apiSecret,
            permissions: ['read', 'write'],
            isActive: true,
            usageCount: 0,
            lastUsed: null
        });

        await defaultApiKey.save();
        console.log('✅ Default API key created for:', businessEmail);
        return defaultApiKey;
    } catch (error) {
        console.error('❌ Error creating default API key:', error);
        // Don't throw error to prevent signup failure
        return null;
    }
};

// Function to create initial dashboard metrics for new users
const createInitialDashboardMetrics = async (businessEmail, userType) => {
    try {
        // Only create dashboard metrics for business users
        if (userType !== 'business') {
            return;
        }

        await initializeBusinessMetrics(businessEmail);
        console.log('✅ Initial dashboard metrics created for:', businessEmail);
    } catch (error) {
        console.error('❌ Error creating initial dashboard metrics:', error);
        // Don't throw error to prevent signup failure
    }
};

const signup = async (req, res, app) => {
    try {
        let verified = false;
        const { name, email, password, type, businessName } = req.body;

        console.log('🚀 Signup attempt for:', email, 'Type:', type);

        const emailExists = await User.findOne({ email });

        if (emailExists) {
            console.log('❌ Email already exists:', email);
            return res.status(409).json({
                success: false,
                message: "Email already in use"
            });
        } else {
            // Normalize the type field - handle both "Business"/"Personal" and "business"/"customer"
            let normalizedType = 'customer'; // default
            if (type) {
                if (type.toLowerCase() === 'business' || type.toLowerCase() === 'b') {
                    normalizedType = 'business';
                } else if (type.toLowerCase() === 'personal' || type.toLowerCase() === 'customer') {
                    normalizedType = 'customer';
                }
            }

            console.log('📝 Creating user with type:', normalizedType);

            const registerdata = new User({
                name, 
                email, 
                passwordHash: password, 
                type: normalizedType,
                verified,
                businessName: normalizedType === 'business' ? (businessName || name) : undefined
            });
            
            const savedUser = await registerdata.save();
            console.log('✅ User registered successfully:', email, 'ID:', savedUser._id);

            // Create default notification settings for all users
            await createDefaultNotificationSettings(email);

            // Create welcome notification for all users
            const welcomeNotification = await createWelcomeNotification(email, normalizedType);
            console.log('📬 Welcome notification result:', welcomeNotification ? 'Created' : 'Failed');

            // If this is a business user, create additional configurations
            if (normalizedType === 'business') {
                try {
                    console.log('🏢 Setting up business configurations...');
                    
                    // Create default API key first
                    const defaultApi = await createDefaultApiKey(email);
                    console.log('✅ Default API key created for:', email);
                    
                    // Create payment configurations
                    await createDefaultPaymentConfigurations(email);
                    console.log('✅ Payment configurations created for:', email);
                    
                    // Create setup notifications
                    await createSetupNotifications(email);
                    console.log('✅ Setup notifications created for:', email);
                    
                    // Create initial dashboard metrics
                    await createInitialDashboardMetrics(email, normalizedType);
                    console.log('✅ Initial dashboard metrics created for:', email);
                    
                    console.log('✅ Business setup completed for:', email);
                } catch (setupError) {
                    console.error('❌ Error setting up business defaults:', setupError);
                    console.error('Setup error details:', setupError.message);
                }
            }

            // Respond with JSON success
            return res.status(201).json({
                success: true,
                message: normalizedType === 'business' 
                    ? "Business account created successfully! Your payment configurations have been set up. Please login to continue."
                    : "Signup successful. Please login to continue.",
                notificationCreated: !!welcomeNotification,
                userType: normalizedType
            });
        }
    } catch (error) {
        console.error('❌ Signup error:', error);
        console.error('Error details:', error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message
        });
    }
};

module.exports = {
    signup
};