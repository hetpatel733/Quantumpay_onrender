const express = require('express');
const router = express.Router();
const { PaymentConfiguration } = require('../models/PaymentConfiguration');
const { authenticateUser } = require('../services/auth');

// Get payment configuration for a business
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('🔍 Fetching payment configuration for:', req.user.email);

    let config = await PaymentConfiguration.findOne({
      businessEmail: req.user.email
    });

    console.log('📋 Found configuration:', !!config);

    // If no configuration exists, create default one for business users
    if (!config) {
      console.log('🏗️ No payment configuration found, creating default for:', req.user.email);

      // Check if user is business type
      const { User } = require('../models/User');
      const user = await User.findOne({ email: req.user.email });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.type === 'business') {
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
          },
          {
            coinType: 'PYUSD',
            enabled: false,
            address: '',
            label: 'PayPal USD Configuration',
            network: 'Polygon',
            isDefault: false
          }
        ];

        try {
          config = new PaymentConfiguration({
            businessEmail: req.user.email,
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

          await config.save();
          console.log('✅ Created default payment configuration');
        } catch (insertError) {
          console.error('❌ Error creating default configuration:', insertError);
          return res.status(500).json({ success: false, message: 'Error creating configuration' });
        }
      } else {
        // For non-business users, return empty configurations
        console.log('👤 User is not business type, returning empty configurations');
        return res.status(200).json({
          success: true,
          configuration: null,
          message: 'Payment configurations are only available for business accounts'
        });
      }
    }

    console.log('📤 Returning configuration');
    res.status(200).json({ success: true, configuration: config });
  } catch (error) {
    console.error('❌ Error fetching payment configuration:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Update crypto configuration
router.put('/crypto/:coinType', authenticateUser, async (req, res) => {
  try {
    const { coinType } = req.params;
    const updateData = req.body;

    console.log('🔄 Updating crypto config for:', coinType, 'Data:', updateData);

    let config = await PaymentConfiguration.findOne({
      businessEmail: req.user.email
    });

    if (!config) {
      // Create new configuration if it doesn't exist
      console.log('🏗️ Creating new payment configuration for:', req.user.email);
      
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
        },
        {
          coinType: 'PYUSD',
          enabled: false,
          address: '',
          label: 'PayPal USD Configuration',
          network: 'Polygon',
          isDefault: false
        }
      ];

      config = new PaymentConfiguration({
        businessEmail: req.user.email,
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

      await config.save();
      console.log('✅ Created new payment configuration');
    }

    // Find the crypto configuration to update
    const cryptoConfigIndex = config.cryptoConfigurations.findIndex(c => c.coinType === coinType);
    
    if (cryptoConfigIndex !== -1) {
      // Update existing crypto configuration
      Object.assign(config.cryptoConfigurations[cryptoConfigIndex], updateData);
    } else {
      // Add new crypto configuration if it doesn't exist
      const newCryptoConfig = {
        coinType,
        enabled: updateData.enabled || false,
        address: updateData.address || '',
        label: updateData.label || `${coinType} Configuration`,
        network: updateData.network || 'Polygon',
        isDefault: updateData.isDefault || false
      };
      config.cryptoConfigurations.push(newCryptoConfig);
    }

    await config.save();
    console.log('✅ Crypto configuration updated successfully');

    res.status(200).json({
      success: true,
      configuration: config,
      message: `${coinType} configuration updated successfully`
    });
  } catch (error) {
    console.error('❌ Error updating crypto configuration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Toggle crypto enabled/disabled - remove address validation
router.put('/crypto/:coinType/toggle', authenticateUser, async (req, res) => {
  try {
    const { coinType } = req.params;
    const { enabled } = req.body;

    console.log('🔄 Toggling crypto:', coinType, 'Enabled:', enabled);

    let config = await PaymentConfiguration.findOne({
      businessEmail: req.user.email
    });

    if (!config) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment configuration not found. Please refresh the page.' 
      });
    }

    // Find the crypto configuration to toggle
    const cryptoConfig = config.cryptoConfigurations.find(c => c.coinType === coinType);
    
    if (cryptoConfig) {
      cryptoConfig.enabled = enabled;
      
      // Save without validation - let frontend handle address warnings
      await config.save({ validateBeforeSave: false });
      
      console.log('✅ Crypto toggle successful');
      
      // Add warning in response if enabled without address
      let warningMessage = '';
      if (enabled && (!cryptoConfig.address || cryptoConfig.address.trim() === '')) {
        warningMessage = `${coinType} is now enabled but has no wallet address configured. Please add a wallet address to receive payments.`;
      }
      
      res.status(200).json({
        success: true,
        configuration: config,
        message: `${coinType} ${enabled ? 'enabled' : 'disabled'} successfully`,
        warning: warningMessage
      });
    } else {
      res.status(404).json({
        success: false,
        message: `${coinType} configuration not found`
      });
    }
  } catch (error) {
    console.error('❌ Error toggling crypto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Update conversion settings
router.put('/conversion-settings', authenticateUser, async (req, res) => {
  try {
    const { conversionSettings } = req.body;

    if (!conversionSettings) {
      return res.status(400).json({
        success: false,
        message: 'Conversion settings are required'
      });
    }

    const config = await PaymentConfiguration.findOneAndUpdate(
      { businessEmail: req.user.email },
      { $set: { conversionSettings } },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    res.status(200).json({
      success: true,
      configuration: config,
      message: 'Conversion settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating conversion settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update transaction limits
router.put('/transaction-limits', authenticateUser, async (req, res) => {
  try {
    const { transactionLimits } = req.body;

    if (!transactionLimits) {
      return res.status(400).json({
        success: false,
        message: 'Transaction limits are required'
      });
    }

    const config = await PaymentConfiguration.findOneAndUpdate(
      { businessEmail: req.user.email },
      { $set: { transactionLimits } },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    res.status(200).json({
      success: true,
      configuration: config,
      message: 'Transaction limits updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction limits:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update the configuration
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { address, label, network, enabled, conversionSettings, transactionLimits } = req.body;

    // Get the configuration
    const config = await PaymentConfiguration.findById(id);

    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    // Verify the user owns this configuration
    if (config.businessEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Update fields
    if (address !== undefined) config.address = address;
    if (label !== undefined) config.label = label;
    if (network !== undefined) config.network = network;
    if (enabled !== undefined) config.enabled = enabled;

    // Update conversion settings
    if (conversionSettings) {
      if (conversionSettings.autoConvert !== undefined) {
        config.conversionSettings.autoConvert = conversionSettings.autoConvert;
      }
      if (conversionSettings.baseCurrency !== undefined) {
        config.conversionSettings.baseCurrency = conversionSettings.baseCurrency;
      }
      if (conversionSettings.conversionRate !== undefined) {
        config.conversionSettings.conversionRate = conversionSettings.conversionRate;
      }
      if (conversionSettings.slippageTolerance !== undefined) {
        config.conversionSettings.slippageTolerance = conversionSettings.slippageTolerance;
      }
    }

    // Update transaction limits
    if (transactionLimits) {
      if (transactionLimits.minAmount !== undefined) {
        config.transactionLimits.minAmount = transactionLimits.minAmount;
      }
      if (transactionLimits.maxAmount !== undefined) {
        config.transactionLimits.maxAmount = transactionLimits.maxAmount;
      }
      if (transactionLimits.dailyLimit !== undefined) {
        config.transactionLimits.dailyLimit = transactionLimits.dailyLimit;
      }
      if (transactionLimits.monthlyLimit !== undefined) {
        config.transactionLimits.monthlyLimit = transactionLimits.monthlyLimit;
      }
    }

    await config.save();

    res.status(200).json({
      success: true,
      configuration: config,
      message: 'Payment configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment configuration:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update global conversion settings for all configurations
router.put('/global/conversion-settings', authenticateUser, async (req, res) => {
  try {
    const { conversionSettings } = req.body;

    if (!conversionSettings) {
      return res.status(400).json({
        success: false,
        message: 'Conversion settings are required'
      });
    }

    // Update all configurations for this business
    const updateResult = await PaymentConfiguration.updateMany(
      { businessEmail: req.user.email },
      {
        $set: {
          'conversionSettings.autoConvert': conversionSettings.autoConvert,
          'conversionSettings.baseCurrency': conversionSettings.baseCurrency,
          'conversionSettings.conversionRate': conversionSettings.conversionRate,
          'conversionSettings.slippageTolerance': conversionSettings.slippageTolerance
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Global conversion settings updated successfully',
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error updating global conversion settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update global transaction limits for all configurations
router.put('/global/transaction-limits', authenticateUser, async (req, res) => {
  try {
    const { transactionLimits } = req.body;

    if (!transactionLimits) {
      return res.status(400).json({
        success: false,
        message: 'Transaction limits are required'
      });
    }

    // Update all configurations for this business
    const updateResult = await PaymentConfiguration.updateMany(
      { businessEmail: req.user.email },
      {
        $set: {
          'transactionLimits.minAmount': transactionLimits.minAmount,
          'transactionLimits.maxAmount': transactionLimits.maxAmount,
          'transactionLimits.dailyLimit': transactionLimits.dailyLimit,
          'transactionLimits.monthlyLimit': transactionLimits.monthlyLimit
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Global transaction limits updated successfully',
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error updating global transaction limits:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
