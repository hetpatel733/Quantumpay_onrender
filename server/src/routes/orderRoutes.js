const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { BusinessAPI } = require('../models/BusinessAPI');
const { authenticateUser } = require('../services/auth');
const crypto = require('crypto');

// Generate a unique order ID
const generateOrderId = () => {
  return 'ORD-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
};

// Middleware to validate API key for order operations
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    const apiRecord = await BusinessAPI.findOne({ key: apiKey });
    
    if (!apiRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    if (!apiRecord.isActive) {
      return res.status(403).json({
        success: false,
        message: 'API key is disabled'
      });
    }

    // Update usage stats
    await apiRecord.incrementUsage();
    
    req.apiKey = apiRecord;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'API validation error'
    });
  }
};

// Get all orders for the authenticated business
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { status, limit = 20, skip = 0, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = { businessEmail: req.user.email };
    if (status) query.status = status;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const orders = await Order.find(query)
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit));
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        skip: Number(skip),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a specific order
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Verify the user owns this order
    if (order.businessEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new order
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { productName, amountUSD, customerEmail, description, metadata } = req.body;
    
    if (!productName || !amountUSD) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name and amount are required' 
      });
    }
    
    const orderId = generateOrderId();
    
    const order = new Order({
      orderId,
      businessEmail: req.user.email,
      productName,
      amountUSD,
      customerEmail: customerEmail || '',
      description: description || '',
      status: 'pending',
      isActive: true,
      metadata: metadata || {}
    });
    
    await order.save();
    
    res.status(201).json({ 
      success: true, 
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create order with API key (for external integrations)
router.post('/api', async (req, res) => {
  try {
    const { apiKey, productName, amountUSD, customerEmail, description, metadata } = req.body;
    
    if (!apiKey || !productName || !amountUSD) {
      return res.status(400).json({ 
        success: false, 
        message: 'API key, product name, and amount are required' 
      });
    }
    
    // Verify API key
    const apiKeyDoc = await BusinessAPI.findOne({ apiKey, isActive: true });
    
    if (!apiKeyDoc) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive API key' });
    }
    
    const orderId = generateOrderId();
    
    const order = new Order({
      orderId,
      businessEmail: apiKeyDoc.businessEmail,
      productName,
      amountUSD,
      customerEmail: customerEmail || '',
      description: description || '',
      status: 'pending',
      isActive: true,
      metadata: metadata || {}
    });
    
    await order.save();
    
    // Update API key usage stats
    apiKeyDoc.lastUsed = new Date();
    apiKeyDoc.usageCount += 1;
    await apiKeyDoc.save();
    
    res.status(201).json({ 
      success: true, 
      order: {
        orderId: order.orderId,
        amountUSD: order.amountUSD,
        status: order.status,
        createdAt: order.createdAt
      },
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order with API key:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update an order
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { productName, amountUSD, customerEmail, description, status, isActive, metadata } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Verify the user owns this order
    if (order.businessEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Update fields
    if (productName) order.productName = productName;
    if (amountUSD) order.amountUSD = amountUSD;
    if (customerEmail) order.customerEmail = customerEmail;
    if (description) order.description = description;
    if (status) order.status = status;
    if (isActive !== undefined) order.isActive = isActive;
    if (metadata) order.metadata = { ...order.metadata, ...metadata };
    
    await order.save();
    
    res.status(200).json({ 
      success: true, 
      order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel an order
router.post('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Verify the user owns this order
    if (order.businessEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled in ${order.status} status` 
      });
    }
    
    order.status = 'cancelled';
    order.isActive = false;
    
    await order.save();
    
    res.status(200).json({ 
      success: true, 
      order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete an order (soft delete by setting isActive to false)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Verify the user owns this order
    if (order.businessEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    order.isActive = false;
    await order.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Apply API validation to public order creation endpoint
router.post('/public', validateApiKey, async (req, res) => {
  try {
    const { productName, amountUSD, customerEmail, description, metadata } = req.body;
    
    if (!productName || !amountUSD) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name and amount are required' 
      });
    }
    
    const orderId = generateOrderId();
    
    const order = new Order({
      orderId,
      businessEmail: req.apiKey.businessEmail,
      productName,
      amountUSD,
      customerEmail: customerEmail || '',
      description: description || '',
      status: 'pending',
      isActive: true,
      metadata: metadata || {}
    });
    
    await order.save();
    
    res.status(201).json({ 
      success: true, 
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating public order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
