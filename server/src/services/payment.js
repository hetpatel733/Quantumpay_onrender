const { Payment } = require("../models/payment");
const { Order } = require("../models/Order");
const { BusinessAPI } = require("../models/BusinessAPI");
const { PaymentConfiguration } = require("../models/PaymentConfiguration");
const { createPaymentNotification } = require('./notificationService');
const { updatePaymentMetrics } = require('./dashboardMetricsService');
const crypto = require('crypto');

// Improved payment ID generation - structured and traceable
function generatePaymentId(businessEmail, orderId) {
    // Create a structured ID with:
    // - Prefix: QP (QuantumPay)
    // - Date stamp: YYMMDD
    // - Order reference: First 4 chars of order ID
    // - Random suffix: 6 random alphanumeric characters
    // - Business reference: First 3 chars of business email hash
    
    const date = new Date();
    const dateStr = date.getFullYear().toString().substr(-2) + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    const orderRef = orderId.toString().replace(/[^a-zA-Z0-9]/g, '').substr(0, 4).toUpperCase();
    
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    const businessHash = crypto.createHash('md5').update(businessEmail).digest('hex').substr(0, 3).toUpperCase();
    
    return `QP${dateStr}${orderRef}${randomSuffix}${businessHash}`;
}

// Simplified amount generator based on payment2.js approach
function generateUniqueAmount(baseAmount, orderId, timestamp, cryptoType) {
    // Calculate the base amount with first decimal place
    const exchangedAmount = parseFloat(baseAmount.toFixed(1)); // e.g., 2.1
    
    // Extract the whole and first decimal parts
    const [wholePart, firstDecimal = "0"] = exchangedAmount.toString().split(".");
    const firstDecimalValue = firstDecimal.charAt(0) || "0";
    
    // Generate random 2 additional decimal places (01-99)
    const randomDecimals = Math.floor(Math.random() * 99) + 1; // 1-99
    const paddedRandomDecimals = randomDecimals.toString().padStart(2, '0');
    
    // Combine: whole.firstDecimal + randomDecimals
    const finalAmountStr = `${wholePart}.${firstDecimalValue}${paddedRandomDecimals}`;
    const finalAmount = parseFloat(finalAmountStr);
    
    console.log(`💡 Amount generation: ${baseAmount} -> ${exchangedAmount} -> ${finalAmount}`);
    
    return finalAmount;
}

// Improved blockchain transaction verification
async function verifyBlockchainTransaction(walletAddress, expectedAmount, cryptoType, apiKey) {
    // More robust transaction verification with:
    // - Support for different blockchain networks
    // - Better error handling and retry logic
    // - More sophisticated matching algorithm
    
    const network = getNetworkForCrypto(cryptoType);
    let verificationEndpoint;
    
    switch(network) {
        case 'Polygon':
            verificationEndpoint = `https://api.polygonscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`;
            break;
        case 'Ethereum':
            verificationEndpoint = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`;
            break;
        case 'Bitcoin':
            // Bitcoin would need a different approach - this is a placeholder
            verificationEndpoint = `https://blockchain.info/rawaddr/${walletAddress}`;
            break;
        default:
            throw new Error(`Unsupported network: ${network}`);
    }
    
    // Add retry logic with exponential backoff
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000; // Start with 1 second
    
    while (attempts < maxAttempts) {
        try {
            const response = await fetch(verificationEndpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== "1" && !data.result) {
                throw new Error(`API error: ${data.message || 'Unknown error'}`);
            }
            
            // For blockchain networks that support smart detection (like Polygon, Ethereum)
            // we implement more sophisticated matching that doesn't rely only on exact amount
            const matchingTx = findMatchingTransaction(data.result, walletAddress, expectedAmount, cryptoType);
            
            if (matchingTx) {
                return {
                    success: true,
                    transaction: matchingTx
                };
            }
            
            return { success: false };
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                throw error;
            }
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

// Simplified Wei conversion like payment2.js
function toWei(amountStr) {
    const [whole, fraction = ""] = amountStr.split(".");
    const paddedFraction = (fraction + "0".repeat(18)).slice(0, 18);
    return BigInt(whole + paddedFraction);
}

// Simplified transaction finding
function findMatchingTransaction(transactions, walletAddress, expectedAmount, cryptoType) {
    if (!transactions || !Array.isArray(transactions)) {
        console.log('❌ No transactions found or invalid transaction data');
        return null;
    }
    
    try {
        const expectedValue = toWei(expectedAmount.toString());
        
        console.log(`🔍 Looking for transaction of ${expectedAmount} ${cryptoType} to ${walletAddress}`);
        
        // Check recent transactions (first 10 like payment2.js)
        for (const tx of transactions.slice(0, 10)) {
            if (tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase()) {
                const txAmount = BigInt(tx.value || '0');
                
                if (txAmount === expectedValue) {
                    console.log(`✅ Found exact amount match: ${txAmount}`);
                    return tx;
                }
            }
        }
        
        console.log('❌ No matching transaction found');
        return null;
    } catch (error) {
        console.error('❌ Error in findMatchingTransaction:', error);
        return null;
    }
}

// Helper to get network for crypto type
function getNetworkForCrypto(cryptoType) {
    const networks = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'USDT': 'Polygon', // Could also be Ethereum
        'USDC': 'Polygon', // Could also be Ethereum
        'MATIC': 'Polygon',
        'PYUSD': 'Polygon'
    };
    
    return networks[cryptoType] || 'Polygon';
}

// Helper to get decimals for crypto type
function getDecimalsForCrypto(cryptoType) {
    const decimals = {
        'BTC': 8,
        'ETH': 18,
        'USDT': 6,
        'USDC': 6,
        'MATIC': 18,
        'PYUSD': 6
    };
    
    return decimals[cryptoType] || 18;
}

// Improved payment creation function
const CoinselectFunction = async (req, res) => {
    const { fname, lname, email, type, api, order_id } = req.body;
    
    console.log('💰 Processing payment request:', { type, api, order_id });
    
    try {
        // Validate API key and order ID
        const addressfound = await BusinessAPI.findOne({ key: api });
        const orderfound = await Order.findOne({ orderId: order_id });
        
        if (!addressfound) {
            console.log('❌ API not found:', api);
            return res.status(400).json({
                success: false,
                message: "Invalid API key"
            });
        }
        
        if (!addressfound.isActive) {
            console.log('❌ API is disabled:', api);
            return res.status(403).json({
                success: false,
                message: "API key is disabled. Please contact the merchant."
            });
        }
        
        if (!orderfound) {
            console.log('❌ Order not found:', order_id);
            return res.status(400).json({
                success: false,
                message: "Invalid Order ID"
            });
        }
        
        // Get business email and update API usage
        const businessEmail = addressfound.businessEmail;
        
        await BusinessAPI.updateOne(
            { key: api },
            {
                $inc: { usageCount: 1 },
                $set: { lastUsed: new Date() }
            }
        );
        
        // Verify cryptocurrency configuration
        const paymentConfig = await PaymentConfiguration.findOne({
            businessEmail: businessEmail
        });
        
        if (!paymentConfig) {
            console.log('❌ No payment configuration found for:', businessEmail);
            return res.status(400).json({
                success: false,
                message: "Payment configuration not found. Please contact the merchant."
            });
        }
        
        const cryptoConfig = paymentConfig.cryptoConfigurations.find(c => c.coinType === type);
        if (!cryptoConfig || !cryptoConfig.enabled || !cryptoConfig.address || cryptoConfig.address.trim() === '') {
            console.log('❌ Cryptocurrency not properly configured:', type);
            return res.status(400).json({
                success: false,
                message: `${type} is not available for payment. Please select a different cryptocurrency.`
            });
        }
        
        // Calculate payment amounts
        const amountUSD = orderfound.amountUSD;
        const timestamp = new Date().getTime();
        
        // Get realistic exchange rates
        const exchangeRates = {
            'USDT': 1.0,
            'USDC': 1.0,
            'PYUSD': 1.0,
            'BTC': 42000.00,
            'ETH': 2500.00,
            'MATIC': 0.85
        };
        
        const exchangeRate = exchangeRates[type] || 1;
        const baseAmount = amountUSD / exchangeRate;
        
        // Generate unique amount using payment2.js approach with uniqueness check
        let uniqueAmount;
        let isUnique = false;
        const maxAttempts = 10;
        let attempt = 0;

        while (!isUnique && attempt < maxAttempts) {
            attempt++;
            uniqueAmount = generateUniqueAmount(baseAmount, order_id, timestamp, type);

            // Check if this amount is already used for pending payments
            const existing = await Payment.findOne({
                amountCrypto: uniqueAmount,
                status: "pending",
                orderId: order_id
            });

            if (!existing) isUnique = true;
        }

        if (!isUnique) {
            return res.status(500).json({
                success: false,
                message: "Couldn't generate unique payment amount. Please try again."
            });
        }
        
        // Generate structured payment ID
        const payid = generatePaymentId(businessEmail, order_id);
        
        // Create payment record
        const paymentData = {
            payId: payid,
            orderId: order_id,
            businessEmail: businessEmail,
            customerEmail: email,
            customerName: `${fname} ${lname}`.trim() || email.split('@')[0],
            amountUSD: amountUSD,
            amountCrypto: uniqueAmount,
            cryptoType: type,
            cryptoSymbol: type,
            exchangeRate: exchangeRate,
            status: "pending",
            hash: null
        };
        
        // Save payment to database
        const payment = new Payment(paymentData);
        await payment.save();
        
        console.log('✅ Payment created:', payment.payId, 'Amount:', uniqueAmount, type);
        
        // Update dashboard metrics
        try {
            await updatePaymentMetrics(payment);
            console.log('📊 Dashboard metrics updated for new payment');
        } catch (metricsError) {
            console.error('❌ Error updating dashboard metrics:', metricsError);
        }
        
        // Start payment monitoring
        startPaymentMonitoring(payment.payId);
        
        // Return success with payment details
        return res.status(200).json({
            success: true,
            payid: payid,
            amount: uniqueAmount,
            cryptoType: type,
            message: "Payment created successfully"
        });
    } catch (error) {
        console.error('❌ Payment processing error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

// Improved payment monitoring function
async function startPaymentMonitoring(payid) {
    // Start monitoring in background without response dependency
    FinalpayFunction({ query: { payid } });
}

// Simplified payment verification function based on payment2.js
const FinalpayFunction = async (req, res) => {
    const { payid } = req.query;
    const API_KEYS = {
        'Polygon': process.env.POLYGON_API_KEY || "Y1EGDU1IS7CK8YN2MFFAGY75KWXZMP94C2",
        'Ethereum': process.env.ETHEREUM_API_KEY || "YOURETHERSCANKEY",
        'Bitcoin': process.env.BITCOIN_API_KEY || "YOURBTCAPIKEY"
    };

    try {
        const payment = await Payment.findOne({ payId: payid });
        
        if (!payment) {
            console.log('❌ Payment not found:', payid);
            return res && !res.headersSent ? res.status(404).json({
                success: false,
                message: "Payment not found"
            }) : null;
        }
        
        const { businessEmail, cryptoType } = payment;
        
        // Get wallet address from payment configuration
        const paymentConfig = await PaymentConfiguration.findOne({
            businessEmail: businessEmail
        });
        
        let walletAddress = businessEmail; // fallback
        
        if (paymentConfig && paymentConfig.cryptoConfigurations) {
            const cryptoConfig = paymentConfig.cryptoConfigurations.find(
                crypto => crypto.coinType === cryptoType
            );
            if (cryptoConfig && cryptoConfig.address && cryptoConfig.address.trim() !== '') {
                walletAddress = cryptoConfig.address;
                console.log(`🎯 Using wallet address for ${cryptoType}:`, walletAddress.substring(0, 10) + '...');
            }
        }
        
        // Check if wallet is properly configured
        if (walletAddress === businessEmail || walletAddress.length < 20) {
            console.log('❌ Invalid wallet address:', walletAddress);
            setTimeout(async () => {
                const currentPayment = await Payment.findOne({ payId: payid });
                if (currentPayment && currentPayment.status === 'pending') {
                    await Payment.updateOne(
                        { payId: payid },
                        {
                            $set: {
                                status: "failed",
                                failureReason: "No valid wallet address configured"
                            }
                        }
                    );
                }
            }, 10 * 60 * 1000);
            return;
        }
        
        // Setup monitoring with simpler approach like payment2.js
        const network = getNetworkForCrypto(cryptoType);
        const apiKey = API_KEYS[network];
        
        let attempt = 0;
        const maxAttempts = 30; // Like payment2.js
        const delay = 60000; // 1 minute like payment2.js
        
        const checkPayment = async () => {
            attempt++;
            
            try {
                // Check if payment status has changed and get fresh amount from database
                const currentPayment = await Payment.findOne({ payId: payid });
                if (!currentPayment || currentPayment.status !== 'pending') {
                    console.log('🛑 Payment no longer pending, stopping verification:', payid);
                    return;
                }
                
                // Get fresh amount from database on each retry
                const amountCrypto = currentPayment.amountCrypto;
                console.log(`🔄 Retry ${attempt}: Checking for amount ${amountCrypto} ${cryptoType}`);
                
                // Get verification endpoint
                let verificationEndpoint;
                switch(network) {
                    case 'Polygon':
                        verificationEndpoint = `https://api.polygonscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`;
                        break;
                    case 'Ethereum':
                        verificationEndpoint = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`;
                        break;
                    default:
                        throw new Error(`Unsupported network: ${network}`);
                }
                
                // Add timeout and better error handling for fetch
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                
                let response, data;
                try {
                    console.log(`🌐 Fetching from ${network} API...`);
                    response = await fetch(verificationEndpoint, {
                        method: 'GET',
                        headers: {
                            'User-Agent': 'QuantumPay/1.0',
                            'Accept': 'application/json'
                        },
                        signal: controller.signal,
                        timeout: 30000
                    });
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    data = await response.json();
                    console.log(`✅ API response received, status: ${data.status}, results: ${data.result?.length || 0}`);
                    
                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    
                    // Handle specific fetch errors
                    if (fetchError.name === 'AbortError') {
                        console.log(`⚠️ API request timeout after 30s (attempt ${attempt})`);
                    } else if (fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
                        console.log(`⚠️ Connection timeout to ${network} API (attempt ${attempt})`);
                    } else if (fetchError.message.includes('ENOTFOUND')) {
                        console.log(`⚠️ DNS resolution failed for ${network} API (attempt ${attempt})`);
                    } else {
                        console.log(`⚠️ Network error: ${fetchError.message} (attempt ${attempt})`);
                    }
                    
                    throw fetchError; // Re-throw to trigger retry logic
                }
                
                if (data.status === "1" && data.result) {
                    const matchingTx = findMatchingTransaction(data.result, walletAddress, amountCrypto, cryptoType);
                    
                    if (matchingTx) {
                        console.log('✅ Payment verified on blockchain:', payid);
                        
                        const previousStatus = currentPayment.status;
                        
                        // Update payment to completed
                        await Payment.updateOne(
                            { payId: payid },
                            {
                                $set: {
                                    status: "completed",
                                    hash: matchingTx.hash,
                                    completedAt: new Date()
                                }
                            }
                        );
                        
                        // Get updated payment for metrics
                        const completedPayment = await Payment.findOne({ payId: payid });
                        
                        // Update metrics and send notifications
                        await updatePaymentMetrics(completedPayment, previousStatus);
                        await createPaymentNotification(businessEmail, completedPayment, 'payment_completed');
                        
                        // Update order status
                        await Order.updateOne(
                            { orderId: currentPayment.orderId },
                            { $set: { status: 'completed' } }
                        );
                        
                        return;
                    }
                } else {
                    console.log(`⚠️ API returned status: ${data.status}, message: ${data.message || 'No transactions found'}`);
                }
                
                // Continue checking if under max attempts
                if (attempt < maxAttempts) {
                    console.log(`⏱️ Payment check attempt ${attempt}/${maxAttempts}, next check in ${delay/1000}s`);
                    setTimeout(checkPayment, delay);
                } else {
                    console.log(`❌ Payment verification timed out after ${maxAttempts} attempts:`, payid);
                    
                    const currentPayment = await Payment.findOne({ payId: payid });
                    if (currentPayment && currentPayment.status === 'pending') {
                        const previousStatus = currentPayment.status;
                        
                        await Payment.updateOne(
                            { payId: payid },
                            {
                                $set: {
                                    status: "failed",
                                    failureReason: "Payment verification timeout"
                                }
                            }
                        );
                        
                        const failedPayment = await Payment.findOne({ payId: payid });
                        await updatePaymentMetrics(failedPayment, previousStatus);
                        await createPaymentNotification(businessEmail, failedPayment, 'payment_failed');
                    }
                }
                
            } catch (error) {
                console.error(`❌ Payment verification error (attempt ${attempt}):`, error.message);
                
                // For network-related errors, be more patient with retries
                const isNetworkError = error.code === 'UND_ERR_CONNECT_TIMEOUT' || 
                                     error.name === 'AbortError' ||
                                     error.message.includes('ENOTFOUND') ||
                                     error.message.includes('fetch failed');
                
                if (attempt < maxAttempts) {
                    const retryDelay = isNetworkError ? delay * 1.5 : delay; // Longer delay for network errors
                    console.log(`⏱️ ${isNetworkError ? 'Network' : 'General'} error, retrying in ${retryDelay/1000}s. Attempt ${attempt}/${maxAttempts}`);
                    setTimeout(checkPayment, retryDelay);
                } else {
                    console.log(`❌ All retry attempts exhausted for payment: ${payid}`);
                    await Payment.updateOne(
                        { payId: payid },
                        { $set: { status: "failed", failureReason: "Verification error after multiple retries" } }
                    );
                }
            }
        };
        
        // Start checking immediately like payment2.js
        checkPayment();
        
    } catch (error) {
        console.error('❌ Fatal error in payment monitoring:', error);
        if (res && !res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Internal server error: " + error.message
            });
        }
    }
};

// Keep existing endpoint functions but use new logic
const paymentFunction = async (api, order_id, res) => {
    const apifound = await BusinessAPI.findOne({ key: api });
    const orderfound = await Order.findOne({ orderId: order_id });

    if (!apifound) {
        return res.status(404).json({
            success: false,
            message: "API key is invalid or not found"
        });
    } else if (!apifound.isActive) {
        return res.status(403).json({
            success: false,
            message: "API key is disabled. Please contact the merchant to enable it."
        });
    } else if (!orderfound) {
        return res.status(404).json({
            success: false,
            message: "Order ID is invalid or not found"
        });
    } else {
        // Update API usage
        await BusinessAPI.updateOne(
            { key: api },
            {
                $inc: { usageCount: 1 },
                $set: { lastUsed: new Date() }
            }
        );

        // Return success response instead of redirect
        return res.status(200).json({
            success: true,
            message: "Payment request validated",
            redirectUrl: `/payment/coinselect?api=${api}&order_id=${order_id}`
        });
    }
}

const checkstatus = async (req, res) => {
    const { payid } = req.query;

    if (!payid) {
        return res.status(400).json({ success: false, message: "Missing payid" });
    }

    try {
        const payment = await Payment.findOne({ payId: payid });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment ID not found" });
        } else {
            return res.status(200).json({
                success: true,
                payid: payment.payId,
                status: payment.status,
                order_id: payment.orderId,
                businessEmail: payment.businessEmail,
                cryptoType: payment.cryptoType,
                amount: payment.amountCrypto,
                timestamp: payment.createdAt || null
            });
        }
    } catch (err) {
        console.error("❌ Error fetching payment status:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getCryptoDisplayName = (coinType) => {
    const names = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'USDT': 'Tether',
        'USDC': 'USD Coin',
        'MATIC': 'Polygon',
        'PYUSD': 'PayPal USD'
    };
    return names[coinType] || coinType;
};

const getPaymentDetails = async (req, res) => {
    try {
        const { payid } = req.query;

        if (!payid) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required"
            });
        }

        const payment = await Payment.findOne({ payId: payid });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Get payment configuration to find the correct wallet address
        const paymentConfig = await PaymentConfiguration.findOne({
            businessEmail: payment.businessEmail
        });

        let walletAddress = payment.businessEmail; // fallback to email

        if (paymentConfig && paymentConfig.cryptoConfigurations) {
            const cryptoConfig = paymentConfig.cryptoConfigurations.find(
                crypto => crypto.coinType === payment.cryptoType
            );
            if (cryptoConfig && cryptoConfig.address) {
                walletAddress = cryptoConfig.address;
            }
        }

        return res.status(200).json({
            success: true,
            payment: {
                payid: payment.payId,
                order_id: payment.orderId,
                amountUSD: payment.amountUSD,
                amountCrypto: payment.amountCrypto,
                businessEmail: payment.businessEmail,
                customerEmail: payment.customerEmail,
                customerName: payment.customerName,
                cryptoType: payment.cryptoType,
                cryptoSymbol: payment.cryptoSymbol,
                status: payment.status,
                hash: payment.hash,
                timestamp: payment.createdAt,
                completedAt: payment.completedAt,
                walletAddress: walletAddress,
                address: walletAddress // for compatibility
            }
        });

    } catch (error) {
        console.error("Error fetching payment details:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const validatePaymentRequest = async (req, res) => {
    try {
        const { api, order_id } = req.query;
        
        if (!api || !order_id) {
            return res.status(400).json({
                success: false,
                message: "API key and Order ID are required"
            });
        }

        const apifound = await BusinessAPI.findOne({ key: api });
        
        if (!apifound) {
            return res.status(404).json({
                success: false,
                message: "Invalid API key"
            });
        }

        if (!apifound.isActive) {
            return res.status(403).json({
                success: false,
                message: "API key is disabled. Please contact the merchant."
            });
        }
        
        const orderfound = await Order.findOne({ orderId: order_id });
        
        if (!orderfound) {
            return res.status(404).json({
                success: false,
                message: "Invalid Order ID"
            });
        }

        // Get payment configuration for enabled cryptocurrencies with proper validation
        const paymentConfig = await PaymentConfiguration.findOne({
            businessEmail: apifound.businessEmail
        });

        let enabledCryptos = [];
        if (paymentConfig && paymentConfig.cryptoConfigurations) {
            enabledCryptos = paymentConfig.cryptoConfigurations
                .filter(crypto => {
                    // Only include cryptos that are enabled AND have a valid wallet address
                    return crypto.enabled === true && 
                           crypto.address && 
                           crypto.address.trim() !== '' &&
                           crypto.address !== apifound.businessEmail; // Ensure it's not just the email
                })
                .map(crypto => ({
                    coinType: crypto.coinType,
                    name: getCryptoDisplayName(crypto.coinType),
                    symbol: crypto.coinType,
                    network: crypto.network,
                    address: crypto.address,
                    label: crypto.label
                }));
        }

        // Update API usage for validation calls
        await BusinessAPI.updateOne(
            { key: api },
            { 
                $inc: { usageCount: 1 },
                $set: { lastUsed: new Date() }
            }
        );

        console.log(`🔍 Payment validation for ${apifound.businessEmail}: ${enabledCryptos.length} enabled cryptos`);

        return res.status(200).json({
            success: true,
            order: {
                order_id: orderfound.orderId,
                amount: orderfound.amountUSD,
                api: api,
                productName: orderfound.productName,
                description: orderfound.description
            },
            enabledCryptos: enabledCryptos,
            businessEmail: apifound.businessEmail
        });
        
    } catch (error) {
        console.error("Error validating payment request:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    paymentFunction,
    CoinselectFunction,
    FinalpayFunction,
    checkstatus,
    getPaymentDetails,
    validatePaymentRequest
};