const paymentData = {
    id: 'PAY_2024_001234',
    amount: 2450.00,
    cryptoAmount: 0.06125,
    currency: 'USD',
    cryptoCurrency: 'BTC',
    status: 'completed',
    timestamp: '2024-01-15T14:30:00Z',
    blockchainHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    confirmations: 12,
    networkFee: 0.0001,
    platformFee: 24.50,
    customer: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
    },
    recipient: {
        walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        walletType: 'Bitcoin Core',
        exchangeRate: 40000.00
    },
    timeline: [
        {
            status: 'initiated',
            timestamp: '2024-01-15T14:30:00Z',
            description: 'Payment request created'
        },
        {
            status: 'processing',
            timestamp: '2024-01-15T14:32:15Z',
            description: 'Transaction broadcasted to network'
        },
        {
            status: 'confirmed',
            timestamp: '2024-01-15T14:45:30Z',
            description: 'First blockchain confirmation received'
        },
        {
            status: 'completed',
            timestamp: '2024-01-15T15:15:00Z',
            description: 'Payment completed with 6+ confirmations'
        }
    ],
    communications: [
        {
            id: 1,
            type: 'email',
            direction: 'outbound',
            subject: 'Payment Confirmation - Invoice #INV-2024-001',
            timestamp: '2024-01-15T15:20:00Z',
            status: 'delivered'
        },
        {
            id: 2,
            type: 'notification',
            direction: 'outbound',
            subject: 'Transaction completed successfully',
            timestamp: '2024-01-15T15:15:30Z',
            status: 'read'
        }
    ],
    notes: [
        {
            id: 1,
            author: 'System',
            content: 'Automatic payment processing completed without issues.',
            timestamp: '2024-01-15T15:15:00Z'
        }
    ]
};
const paymentinfo = async (req, res) => {
    console.log("🚀 REQUEST RECEIVED: Payment info request");
    
    const { id, payid } = req.query;
    console.log("🔍 Looking for payment with ID:", id || payid);
    
    // If a specific payment ID is requested, fetch from database
    if (id || payid) {
        try {
            const { Payment } = require("../models/payment");
            const { PaymentConfiguration } = require("../models/PaymentConfiguration");
            
            console.log("🔍 Searching for payment in database...");
            
            // First, let's check what payments exist
            const totalPayments = await Payment.countDocuments({});
            console.log("💾 Total payments in database:", totalPayments);
            
            if (totalPayments > 0) {
                const samplePayments = await Payment.find({}).limit(3).select('payId businessEmail status');
                console.log("📋 Sample payments:", samplePayments);
            }
            
            const payment = await Payment.findOne({ 
                $or: [
                    { payId: id || payid },
                    { _id: id }
                ]
            });
            
            console.log("🔍 Payment found:", !!payment);
            
            if (!payment) {
                console.log("❌ Payment not found for ID:", id || payid);
                return res.status(404).json({
                    success: false,
                    message: "Payment not found",
                    debug: {
                        searchedId: id || payid,
                        totalPaymentsInDB: totalPayments
                    }
                });
            }

            console.log("✅ Payment found:", payment.payId, "Status:", payment.status);

            // Get payment configuration to find the correct wallet address
            const paymentConfig = await PaymentConfiguration.findOne({
                businessEmail: payment.businessEmail
            });

            let walletAddress = payment.businessEmail; // fallback to email
            let walletType = 'Business Email';
            
            if (paymentConfig && paymentConfig.cryptoConfigurations) {
                const cryptoConfig = paymentConfig.cryptoConfigurations.find(
                    crypto => crypto.coinType === payment.cryptoType
                );
                if (cryptoConfig && cryptoConfig.address) {
                    walletAddress = cryptoConfig.address;
                    walletType = `${payment.cryptoType} Wallet`;
                }
            }
            
            const responseData = {
                success: true,
                payment: {
                    id: payment.payId,
                    payId: payment.payId,
                    orderId: payment.orderId,
                    amount: payment.amountUSD,
                    cryptoAmount: payment.amountCrypto,
                    currency: 'USD',
                    cryptoCurrency: payment.cryptoType,
                    status: payment.status,
                    timestamp: payment.createdAt,
                    completedAt: payment.completedAt,
                    hash: payment.hash,
                    blockchainHash: payment.hash,
                    confirmations: payment.status === 'completed' ? 12 : 0,
                    networkFee: 0.0001,
                    platformFee: payment.amountUSD * 0.01, // 1% platform fee
                    businessEmail: payment.businessEmail,
                    customerEmail: payment.customerEmail,
                    customerName: payment.customerName,
                    type: payment.cryptoType,
                    address: walletAddress,
                    walletAddress: walletAddress,
                    order_id: payment.orderId,
                    customer: {
                        name: payment.customerName || payment.customerEmail.split('@')[0],
                        email: payment.customerEmail,
                        company: 'Customer',
                        id: payment.payId,
                        avatar: '/images/default-avatar.png'
                    },
                    recipient: {
                        walletAddress: walletAddress,
                        walletType: walletType,
                        exchangeRate: payment.exchangeRate || 40000.00
                    },
                    timeline: [
                        {
                            status: 'initiated',
                            timestamp: payment.createdAt,
                            description: 'Payment request created'
                        },
                        ...(payment.status === 'completed' ? [
                            {
                                status: 'processing',
                                timestamp: new Date(payment.createdAt.getTime() + 2 * 60000), // +2 minutes
                                description: 'Transaction broadcasted to network'
                            },
                            {
                                status: 'confirmed',
                                timestamp: new Date(payment.createdAt.getTime() + 15 * 60000), // +15 minutes
                                description: 'First blockchain confirmation received'
                            },
                            {
                                status: 'completed',
                                timestamp: payment.completedAt || payment.updatedAt,
                                description: 'Payment completed with 6+ confirmations'
                            }
                        ] : [])
                    ],
                    communications: [
                        {
                            id: 1,
                            type: 'email',
                            direction: 'outbound',
                            subject: `Payment Confirmation - Order #${payment.orderId}`,
                            timestamp: payment.createdAt,
                            status: 'delivered'
                        }
                    ],
                    notes: [
                        {
                            id: 1,
                            author: 'System',
                            content: payment.status === 'completed' 
                                ? 'Payment processing completed successfully.' 
                                : 'Payment is being processed.',
                            timestamp: payment.updatedAt
                        }
                    ]
                }
            };
            
            console.log("📤 Returning payment data for:", payment.payId);
            return res.status(200).json(responseData);
        } catch (error) {
            console.error("❌ Error fetching payment:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error: " + error.message
            });
        }
    }
    
    // Return mock data for demo purposes
    console.log("📄 Returning mock payment data");
    res.status(200).json({
        success: true,
        payment: paymentData
    });
}

module.exports = {
    paymentinfo
};
