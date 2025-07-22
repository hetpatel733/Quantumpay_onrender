const express = require('express');
const router = express.Router();
const { Payment } = require('../models/payment');
const { PaymentConfiguration } = require('../models/PaymentConfiguration');
const { Order } = require('../models/Order');
const { authenticateUser } = require('../services/auth');
const crypto = require('crypto');
const { updatePaymentMetrics } = require('../services/dashboardMetricsService');

// Generate a unique payment ID
const generatePaymentId = () => {
  return 'PAY-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
};

// Get all payments for the authenticated business
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, limit = 20, skip = 0, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    console.log('🔍 Fetching payments for:', req.user.email);
    console.log('🔍 Query params:', { status, limit, skip, sortBy, sortOrder });
    
    // First, let's check if any payments exist at all
    const totalPaymentsInDB = await Payment.countDocuments({});
    console.log('💾 Total payments in database:', totalPaymentsInDB);
    
    // Check payments for this specific business
    const businessPaymentsCount = await Payment.countDocuments({ businessEmail: req.user.email });
    console.log('🏢 Payments for this business:', businessPaymentsCount);
    
    // Build query - fix the status filter issue
    const query = { businessEmail: req.user.email };
    
    // Only add status filter if it's a valid status value
    if (status && status !== 'all' && status !== 'undefined' && status !== undefined && status !== 'null') {
      query.status = status;
      console.log('🔍 Adding status filter:', status);
    } else {
      console.log('🔍 No status filter applied (showing all payments)');
    }
    
    console.log('🔍 Final query:', query);
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get payments with detailed logging
    const payments = await Payment.find(query)
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit))
      .lean(); // Use lean for better performance
    
    const total = await Payment.countDocuments(query);
    
    console.log('📦 Found payments:', payments.length, 'Total:', total);
    
    // If no payments found, let's get some sample data for debugging
    if (payments.length === 0 && businessPaymentsCount > 0) {
      console.log('🔍 No payments found with current query. Checking sample payments in DB...');
      const samplePayments = await Payment.find({ businessEmail: req.user.email }).limit(3).lean();
      console.log('📋 Sample payments for this business:', samplePayments.map(p => ({
        payId: p.payId,
        businessEmail: p.businessEmail,
        status: p.status,
        createdAt: p.createdAt
      })));
    }
    
    // Transform payments to ensure consistent data structure
    const transformedPayments = payments.map(payment => ({
      payId: payment.payId,
      id: payment.payId, // Add id for compatibility
      orderId: payment.orderId,
      businessEmail: payment.businessEmail,
      customerEmail: payment.customerEmail,
      customerName: payment.customerName,
      amountUSD: payment.amountUSD,
      amountCrypto: payment.amountCrypto,
      cryptoType: payment.cryptoType,
      cryptoSymbol: payment.cryptoSymbol || payment.cryptoType,
      status: payment.status,
      hash: payment.hash,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      exchangeRate: payment.exchangeRate
    }));
    
    console.log('✅ Returning transformed payments:', transformedPayments.length);
    
    res.status(200).json({
      success: true,
      payments: transformedPayments,
      pagination: {
        total,
        skip: Number(skip),
        limit: Number(limit),
        hasMore: Number(skip) + Number(limit) < total
      },
      debug: {
        totalInDB: totalPaymentsInDB,
        businessCount: businessPaymentsCount,
        queryUsed: query,
        originalStatus: req.query.status
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Get payments for a specific order
router.get('/order/:orderId', authenticateUser, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Verify the order belongs to this business
    const order = await Order.findOne({ 
      orderId,
      businessEmail: req.user.email
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const payments = await Payment.find({ 
      orderId,
      businessEmail: req.user.email
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payments for order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a specific payment
router.get('/:payId', authenticateUser, async (req, res) => {
  try {
    const { payId } = req.params;
    
    console.log('🔍 Fetching payment:', payId, 'for user:', req.user.email);
    
    const payment = await Payment.findOne({ payId });
    
    if (!payment) {
      console.log('❌ Payment not found:', payId);
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    // Verify the payment belongs to this business
    if (payment.businessEmail !== req.user.email) {
      console.log('❌ Unauthorized access attempt:', req.user.email, 'tried to access payment for:', payment.businessEmail);
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get payment configuration to include wallet address
    const paymentConfig = await PaymentConfiguration.findOne({
      businessEmail: payment.businessEmail
    });

    let walletAddress = payment.businessEmail; // fallback
    
    if (paymentConfig && paymentConfig.cryptoConfigurations) {
      const cryptoConfig = paymentConfig.cryptoConfigurations.find(
        crypto => crypto.coinType === payment.cryptoType
      );
      if (cryptoConfig && cryptoConfig.address) {
        walletAddress = cryptoConfig.address;
      }
    }

    const enrichedPayment = {
      ...payment.toObject(),
      walletAddress: walletAddress
    };
    
    console.log('✅ Payment found and enriched:', payId);
    res.status(200).json({ success: true, payment: enrichedPayment });
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Update payment status (manually)
router.put('/:payId/status', authenticateUser, async (req, res) => {
  try {
    const { payId } = req.params;
    const { status, hash } = req.body;
    
    if (!status || !['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status'
      });
    }
    
    const payment = await Payment.findOne({ payId });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    // Verify the payment belongs to this business
    if (payment.businessEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Store previous status for metrics update
    const previousStatus = payment.status;
    
    // Update payment status
    payment.status = status;
    
    if (status === 'completed') {
      payment.completedAt = new Date();
      if (hash) payment.hash = hash;
    } else if (status === 'failed') {
      payment.failureReason = req.body.failureReason || 'Manual status update';
    }
    
    await payment.save();
    
    // Update dashboard metrics
    try {
      await updatePaymentMetrics(payment, previousStatus);
      console.log('📊 Dashboard metrics updated for manual status change');
    } catch (metricsError) {
      console.error('❌ Error updating dashboard metrics:', metricsError);
    }
    
    // If payment completed, update order status too
    if (status === 'completed') {
      await Order.updateOne(
        { orderId: payment.orderId },
        { $set: { status: 'completed' } }
      );
    } else if (status === 'failed' || status === 'cancelled') {
      // Check if this was the only payment, if so revert order to pending
      const otherPayments = await Payment.countDocuments({
        orderId: payment.orderId,
        status: { $nin: ['failed', 'cancelled'] },
        payId: { $ne: payId }
      });
      
      if (otherPayments === 0) {
        await Order.updateOne(
          { orderId: payment.orderId },
          { $set: { status: 'pending' } }
        );
      }
    }
    
    res.status(200).json({ 
      success: true, 
      payment,
      message: `Payment status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel a payment
router.post('/:payId/cancel', authenticateUser, async (req, res) => {
  try {
    const { payId } = req.params;
    
    const payment = await Payment.findOne({ payId });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    // Verify the payment belongs to this business
    if (payment.businessEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Only pending payments can be cancelled
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Payment cannot be cancelled in ${payment.status} status` 
      });
    }
    
    payment.status = 'cancelled';
    await payment.save();
    
    res.status(200).json({ 
      success: true, 
      payment,
      message: 'Payment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Debug endpoint to create a test payment (only for development)
router.post('/debug/create-test', authenticateUser, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    console.log('🧪 Creating test payment for:', req.user.email);
    
    const testPayment = new Payment({
      payId: 'TEST-' + Date.now(),
      orderId: 'ORDER-TEST-' + Date.now(),
      businessEmail: req.user.email,
      customerEmail: 'test@customer.com',
      customerName: 'Test Customer',
      amountUSD: 100,
      amountCrypto: 100.01,
      cryptoType: 'USDT',
      cryptoSymbol: 'USDT',
      exchangeRate: 1.0,
      status: 'pending'
    });
    
    await testPayment.save();
    console.log('✅ Test payment created:', testPayment.payId);
    
    res.json({
      success: true,
      payment: testPayment,
      message: 'Test payment created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating test payment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
