const express = require('express');
const router = express.Router();
const { PaymentConfiguration } = require('../models/PaymentConfiguration');
const { authenticateUser } = require('../services/auth');
const { BusinessAPI } = require('../models/BusinessAPI');

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

      const { User } = require('../models/User');
      const user = await User.findOne({ email: req.user.email });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.type === 'business') {
        const defaultCryptoConfigs = [
          // USDT configurations
          {
            coinType: 'USDT',
            enabled: false,
            address: '',
            label: 'USDT on Polygon',
            network: 'Polygon',
            isDefault: false,
            networkConfig: {
              contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
              decimals: 6,
              chainId: 137,
              explorerUrl: 'https://polygonscan.com'
            }
          },
          {
            coinType: 'USDT',
            enabled: false,
            address: '',
            label: 'USDT on Ethereum',
            network: 'Ethereum',
            isDefault: false,
            networkConfig: {
              contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
              decimals: 6,
              chainId: 1,
              explorerUrl: 'https://etherscan.io'
            }
          },
          {
            coinType: 'USDT',
            enabled: false,
            address: '',
            label: 'USDT on BSC',
            network: 'BSC',
            isDefault: false,
            networkConfig: {
              contractAddress: '0x55d398326f99059fF775485246999027B3197955',
              decimals: 18,
              chainId: 56,
              explorerUrl: 'https://bscscan.com'
            }
          },
          {
            coinType: 'USDT',
            enabled: false,
            address: '',
            label: 'USDT on Solana',
            network: 'Solana',
            isDefault: false,
            networkConfig: {
              contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
              decimals: 6,
              chainId: null,
              explorerUrl: 'https://solscan.io'
            }
          },
          // USDC configurations
          {
            coinType: 'USDC',
            enabled: false,
            address: '',
            label: 'USDC on Polygon',
            network: 'Polygon',
            isDefault: false,
            networkConfig: {
              contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
              decimals: 6,
              chainId: 137,
              explorerUrl: 'https://polygonscan.com'
            }
          },
          {
            coinType: 'USDC',
            enabled: false,
            address: '',
            label: 'USDC on Ethereum',
            network: 'Ethereum',
            isDefault: false,
            networkConfig: {
              contractAddress: '0xA0b86a33E6c8d8e7aB1C3F0F8D0c5E6f8d4eC7b3',
              decimals: 6,
              chainId: 1,
              explorerUrl: 'https://etherscan.io'
            }
          },
          {
            coinType: 'USDC',
            enabled: false,
            address: '',
            label: 'USDC on BSC',
            network: 'BSC',
            isDefault: false,
            networkConfig: {
              contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
              decimals: 18,
              chainId: 56,
              explorerUrl: 'https://bscscan.com'
            }
          },
          {
            coinType: 'USDC',
            enabled: false,
            address: '',
            label: 'USDC on Solana',
            network: 'Solana',
            isDefault: false,
            networkConfig: {
              contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
              decimals: 6,
              chainId: null,
              explorerUrl: 'https://solscan.io'
            }
          },
          // Bitcoin
          {
            coinType: 'BTC',
            enabled: false,
            address: '',
            label: 'Bitcoin',
            network: 'Bitcoin',
            isDefault: false,
            networkConfig: {
              contractAddress: '',
              decimals: 8,
              chainId: null,
              explorerUrl: 'https://blockstream.info'
            }
          },
          // Ethereum
          {
            coinType: 'ETH',
            enabled: false,
            address: '',
            label: 'Ethereum',
            network: 'Ethereum',
            isDefault: false,
            networkConfig: {
              contractAddress: '',
              decimals: 18,
              chainId: 1,
              explorerUrl: 'https://etherscan.io'
            }
          },
          // MATIC (Polygon native token)
          {
            coinType: 'MATIC',
            enabled: false,
            address: '',
            label: 'MATIC (Polygon)',
            network: 'Polygon',
            isDefault: false,
            networkConfig: {
              contractAddress: '',
              decimals: 18,
              chainId: 137,
              explorerUrl: 'https://polygonscan.com'
            }
          },
          // SOL (Solana native token)
          {
            coinType: 'SOL',
            enabled: false,
            address: '',
            label: 'Solana (SOL)',
            network: 'Solana',
            isDefault: false,
            networkConfig: {
              contractAddress: '',
              decimals: 9,
              chainId: null,
              explorerUrl: 'https://solscan.io'
            }
          }
        ];

        // Default API providers
        const defaultApiProviders = [
          {
            name: 'Etherscan',
            apiKey: process.env.ETHERSCAN_API_KEY || 'Y1EGDU1IS7CK8YN2MFFAGY75KWXZMP94C2',
            network: 'EVM',
            baseUrl: 'https://api.etherscan.io/v2/api',
            isActive: true,
            rateLimit: {
              requestsPerSecond: 5,
              requestsPerDay: 100000
            },
            supportedChains: ['Ethereum', 'Polygon', 'BSC']
          },
          {
            name: 'Blockstream',
            apiKey: 'not-required',
            network: 'Bitcoin',
            baseUrl: 'https://blockstream.info/api',
            isActive: true,
            rateLimit: {
              requestsPerSecond: 10,
              requestsPerDay: 1000000
            }
          },
          {
            name: 'Solscan',
            apiKey: process.env.SOLSCAN_API_KEY || 'YourSolscanAPIKey',
            network: 'Solana',
            baseUrl: 'https://api.solscan.io',
            isActive: true,
            rateLimit: {
              requestsPerSecond: 5,
              requestsPerDay: 100000
            }
          }
        ];

        try {
          config = new PaymentConfiguration({
            businessEmail: req.user.email,
            cryptoConfigurations: defaultCryptoConfigs,
            apiProviders: defaultApiProviders,
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
          console.log('✅ Created default payment configuration with all 6 cryptocurrencies (BTC, ETH, USDT, USDC, MATIC, SOL)');
        } catch (insertError) {
          console.error('❌ Error creating default configuration:', insertError);
          console.error('❌ Detailed error:', insertError.stack);
          return res.status(500).json({ success: false, message: 'Error creating configuration: ' + insertError.message });
        }
      } else {
        return res.status(200).json({
          success: true,
          configuration: null,
          message: 'Payment configurations are only available for business accounts'
        });
      }
    } else {
      // Check if existing config is missing MATIC or SOL and add them
      const existingCoinTypes = config.cryptoConfigurations.map(c => `${c.coinType}_${c.network}`);
      const missingConfigs = [];
      
      if (!existingCoinTypes.includes('MATIC_Polygon')) {
        missingConfigs.push({
          coinType: 'MATIC',
          enabled: false,
          address: '',
          label: 'MATIC (Polygon)',
          network: 'Polygon',
          isDefault: false,
          networkConfig: {
            contractAddress: '',
            decimals: 18,
            chainId: 137,
            explorerUrl: 'https://polygonscan.com'
          }
        });
      }
      
      if (!existingCoinTypes.includes('SOL_Solana')) {
        missingConfigs.push({
          coinType: 'SOL',
          enabled: false,
          address: '',
          label: 'Solana (SOL)',
          network: 'Solana',
          isDefault: false,
          networkConfig: {
            contractAddress: '',
            decimals: 9,
            chainId: null,
            explorerUrl: 'https://solscan.io'
          }
        });
      }
      
      // Add missing configurations
      if (missingConfigs.length > 0) {
        config.cryptoConfigurations.push(...missingConfigs);
        await config.save();
        console.log(`✅ Added ${missingConfigs.length} missing crypto configurations (MATIC/SOL)`);
      }
    }

    console.log('📤 Returning configuration');
    res.status(200).json({ success: true, configuration: config });
  } catch (error) {
    console.error('❌ Error fetching payment configuration:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Update crypto configuration with network support
router.put('/crypto/:coinType/:network', authenticateUser, async (req, res) => {
  try {
    const { coinType, network } = req.params;
    const updateData = req.body;

    console.log('🔄 Updating crypto config for:', coinType, 'on', network, 'Data:', updateData);

    let config = await PaymentConfiguration.findOne({
      businessEmail: req.user.email
    });

    if (!config) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment configuration not found. Please refresh the page.' 
      });
    }

    // Find the specific crypto configuration
    const cryptoConfigIndex = config.cryptoConfigurations.findIndex(
      c => c.coinType === coinType && c.network === network
    );
    
    if (cryptoConfigIndex !== -1) {
      // Update existing crypto configuration
      Object.assign(config.cryptoConfigurations[cryptoConfigIndex], updateData);
    } else {
      return res.status(404).json({
        success: false,
        message: `${coinType} configuration on ${network} not found`
      });
    }

    await config.save();
    console.log('✅ Crypto configuration updated successfully');

    res.status(200).json({
      success: true,
      configuration: config,
      message: `${coinType} on ${network} configuration updated successfully`
    });
  } catch (error) {
    console.error('❌ Error updating crypto configuration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Toggle crypto enabled/disabled with network support
router.put('/crypto/:coinType/:network/toggle', authenticateUser, async (req, res) => {
  try {
    const { coinType, network } = req.params;
    const { enabled } = req.body;

    console.log('🔄 Toggling crypto:', coinType, 'on', network, 'Enabled:', enabled);

    if (enabled) {
      const apiKey = await BusinessAPI.findOne({ businessEmail: req.user.email });
      if (!apiKey || !apiKey.isActive) {
        return res.status(403).json({
          success: false,
          message: "Cannot enable cryptocurrency payments while API access is paused. Please contact support to reactivate your API access.",
          errorCode: "API_PAUSED"
        });
      }
    }

    let config = await PaymentConfiguration.findOne({
      businessEmail: req.user.email
    });

    if (!config) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment configuration not found. Please refresh the page.' 
      });
    }

    // Find the specific crypto configuration
    const cryptoConfig = config.cryptoConfigurations.find(
      c => c.coinType === coinType && c.network === network
    );
    
    if (cryptoConfig) {
      cryptoConfig.enabled = enabled;
      
      await config.save({ validateBeforeSave: false });
      
      console.log('✅ Crypto toggle successful');
      
      let warningMessage = '';
      if (enabled && (!cryptoConfig.address || cryptoConfig.address.trim() === '')) {
        warningMessage = `${coinType} on ${network} is now enabled but has no wallet address configured. Please add a wallet address to receive payments.`;
      }
      
      res.status(200).json({
        success: true,
        configuration: config,
        message: `${coinType} on ${network} ${enabled ? 'enabled' : 'disabled'} successfully`,
        warning: warningMessage
      });
    } else {
      res.status(404).json({
        success: false,
        message: `${coinType} on ${network} configuration not found`
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

// Add API providers management endpoint
router.put('/api-providers', authenticateUser, async (req, res) => {
  try {
    const { apiProviders } = req.body;

    if (!apiProviders || !Array.isArray(apiProviders)) {
      return res.status(400).json({
        success: false,
        message: 'API providers array is required'
      });
    }

    const config = await PaymentConfiguration.findOneAndUpdate(
      { businessEmail: req.user.email },
      { $set: { apiProviders } },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    res.status(200).json({
      success: true,
      configuration: config,
      message: 'API providers updated successfully'
    });
  } catch (error) {
    console.error('Error updating API providers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
router.put('/conversion-settings', authenticateUser, async (req, res) => {
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
          conversionSettings: conversionSettings
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
router.put('/transaction-limits', authenticateUser, async (req, res) => {
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
