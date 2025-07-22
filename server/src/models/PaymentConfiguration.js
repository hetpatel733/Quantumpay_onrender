const mongoose = require('mongoose');

const cryptoConfigSchema = new mongoose.Schema({
    coinType: {
        type: String,
        required: true,
        enum: ['USDT', 'USDC', 'BTC', 'ETH', 'MATIC', 'PYUSD'],
        uppercase: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    network: {
        type: String,
        default: 'Polygon',
        enum: ['Polygon', 'Ethereum', 'Bitcoin', 'BSC']
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const paymentConfigurationSchema = new mongoose.Schema({
    businessEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        ref: 'User'
    },
    cryptoConfigurations: [cryptoConfigSchema],
    conversionSettings: {
        autoConvert: {
            type: Boolean,
            default: false
        },
        baseCurrency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
        },
        conversionRate: {
            type: String,
            default: 'real-time',
            enum: ['real-time', 'hourly-average', 'daily-average']
        },
        slippageTolerance: {
            type: Number,
            default: 1.0,
            min: 0.1,
            max: 5.0
        }
    },
    transactionLimits: {
        minAmount: {
            type: Number,
            default: 10
        },
        maxAmount: {
            type: Number,
            default: 50000
        },
        dailyLimit: {
            type: Number,
            default: 100000
        },
        monthlyLimit: {
            type: Number,
            default: 1000000
        }
    }
}, { 
    timestamps: true 
});

// Remove the validation that prevents enabling without address - this should be a frontend warning, not a server error
// Comment out or remove the pre-save validation
// paymentConfigurationSchema.pre('save', function(next) => {
//   for (const config of this.cryptoConfigurations) {
//     if (config.enabled && (!config.address || config.address.trim() === '')) {
//       const error = new Error(`Address is required when ${config.coinType} configuration is enabled`);
//       error.name = 'ValidationError';
//       return next(error);
//     }
//   }
//   next();
// });

// Method to get configuration for specific coin type
paymentConfigurationSchema.methods.getCryptoConfig = function(coinType) {
    return this.cryptoConfigurations.find(config => config.coinType === coinType);
};

// Method to update crypto configuration
paymentConfigurationSchema.methods.updateCryptoConfig = function(coinType, updateData) {
    const config = this.cryptoConfigurations.find(config => config.coinType === coinType);
    if (config) {
        Object.assign(config, updateData);
    } else {
        // Create new configuration if it doesn't exist
        this.cryptoConfigurations.push({ coinType, ...updateData });
    }
    return this.save();
};

// Method to enable/disable crypto
paymentConfigurationSchema.methods.toggleCrypto = function(coinType, enabled) {
    const config = this.getCryptoConfig(coinType);
    if (config) {
        config.enabled = enabled;
        return this.save();
    }
    return Promise.reject(new Error(`Configuration for ${coinType} not found`));
};

// Add indexes for performance
paymentConfigurationSchema.index({ businessEmail: 1 });
paymentConfigurationSchema.index({ 'cryptoConfigurations.coinType': 1 });
paymentConfigurationSchema.index({ 'cryptoConfigurations.enabled': 1 });

const PaymentConfiguration = mongoose.model('PaymentConfiguration', paymentConfigurationSchema);

module.exports = { PaymentConfiguration };
