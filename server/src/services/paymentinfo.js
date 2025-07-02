
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
        company: 'TechCorp Solutions',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        id: 'CUST_789456123'
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
    res.status(200).json(paymentData);
}

module.exports = {
    paymentinfo
};
