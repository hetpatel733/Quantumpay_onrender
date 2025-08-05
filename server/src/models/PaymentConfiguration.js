const mongoose = require('mongoose');

const cryptoConfigSchema = new mongoose.Schema({
    coinType: {
        type: String,
        required: true,
        enum: ['USDT', 'USDC', 'BTC', 'ETH', 'MATIC', 'SOL'],
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
        required: true,
        enum: ['Polygon', 'Ethereum', 'Bitcoin', 'BSC', 'Tron', 'Solana']
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    // Network-specific configuration
    networkConfig: {
        contractAddress: { type: String, default: '' }, // For ERC-20/BEP-20 tokens
        decimals: { type: Number, default: 18 }, // Token decimals
        chainId: { type: Number, default: null }, // Network chain ID
        rpcUrl: { type: String, default: '' }, // Custom RPC if needed
        explorerUrl: { type: String, default: '' }
    }
}, { _id: false });

const apiProviderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Polygonscan', 'Etherscan', 'BSCscan', 'Trongrid', 'Blockstream', 'Blockchain.info', 'Solscan']
    },
    apiKey: {
        type: String,
        required: function() {
            // API key is not required for Blockstream
            return this.name !== 'Blockstream';
        },
        trim: true,
        default: ''
    },
    network: {
        type: String,
        required: true,
        enum: ['Polygon', 'Ethereum', 'Bitcoin', 'BSC', 'Tron', 'Solana', 'EVM']
    },
    baseUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rateLimit: {
        requestsPerSecond: { type: Number, default: 5 },
        requestsPerDay: { type: Number, default: 100000 }
    },
    supportedChains: {
        type: [String],
        default: []
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
    apiProviders: [apiProviderSchema],
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

// Method to get configuration for specific coin type and network
paymentConfigurationSchema.methods.getCryptoConfig = function(coinType, network = null) {
    if (network) {
        return this.cryptoConfigurations.find(config => 
            config.coinType === coinType && config.network === network
        );
    }
    return this.cryptoConfigurations.find(config => config.coinType === coinType);
};

// Method to get all configurations for a specific coin type
paymentConfigurationSchema.methods.getAllCryptoConfigs = function(coinType) {
    return this.cryptoConfigurations.filter(config => config.coinType === coinType);
};

// Method to update crypto configuration with network support
paymentConfigurationSchema.methods.updateCryptoConfig = function(coinType, network, updateData) {
    const config = this.cryptoConfigurations.find(config => 
        config.coinType === coinType && config.network === network
    );
    if (config) {
        Object.assign(config, updateData);
    } else {
        // Create new configuration if it doesn't exist
        this.cryptoConfigurations.push({ coinType, network, ...updateData });
    }
    return this.save();
};

// Method to enable/disable crypto with network support
paymentConfigurationSchema.methods.toggleCrypto = function(coinType, network, enabled) {
    const config = this.getCryptoConfig(coinType, network);
    if (config) {
        config.enabled = enabled;
        return this.save();
    }
    return Promise.reject(new Error(`Configuration for ${coinType} on ${network} not found`));
};

// Method to get enabled payment methods grouped by coin type
paymentConfigurationSchema.methods.getEnabledPaymentMethods = function() {
    const enabledConfigs = this.cryptoConfigurations.filter(config => 
        config.enabled && config.address && config.address.trim() !== ''
    );
    
    const groupedMethods = {};
    enabledConfigs.forEach(config => {
        if (!groupedMethods[config.coinType]) {
            groupedMethods[config.coinType] = [];
        }
        groupedMethods[config.coinType].push({
            network: config.network,
            address: config.address,
            label: config.label
        });
    });
    
    return groupedMethods;
};

// Add indexes for performance
paymentConfigurationSchema.index({ businessEmail: 1 });
paymentConfigurationSchema.index({ 'cryptoConfigurations.coinType': 1 });
paymentConfigurationSchema.index({ 'cryptoConfigurations.enabled': 1 });
paymentConfigurationSchema.index({ 'cryptoConfigurations.network': 1 });

const PaymentConfiguration = mongoose.model('PaymentConfiguration', paymentConfigurationSchema);

module.exports = { PaymentConfiguration };
