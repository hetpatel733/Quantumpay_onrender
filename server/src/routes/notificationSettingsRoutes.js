const express = require('express');
const router = express.Router();
const { NotificationSettings } = require('../models/NotificationSettings');
const { authenticateUser } = require('../services/auth');

// Get notification settings for authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 Fetching notification settings for:', req.user.email);

    let settings = await NotificationSettings.findOne({
      businessEmail: req.user.email
    });

    // If no settings exist, create default ones
    if (!settings) {
      console.log('🏗️ Creating default notification settings for:', req.user.email);
      
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
      console.log('✅ Default notification settings created');
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('❌ Error fetching notification settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Update notification settings
router.put('/', authenticateUser, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications } = req.body;

    console.log('🔄 Updating notification settings for:', req.user.email);

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
    console.log('✅ Notification settings updated successfully');

    res.status(200).json({
      success: true,
      settings,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Reset notification settings to defaults
router.post('/reset', authenticateUser, async (req, res) => {
  try {
    console.log('🔄 Resetting notification settings for:', req.user.email);

    const defaultSettings = {
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
    };

    const settings = await NotificationSettings.findOneAndUpdate(
      { businessEmail: req.user.email },
      defaultSettings,
      { new: true, upsert: true }
    );

    console.log('✅ Notification settings reset to defaults');

    res.status(200).json({
      success: true,
      settings,
      message: 'Notification settings reset to defaults'
    });
  } catch (error) {
    console.error('❌ Error resetting notification settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

module.exports = router;
