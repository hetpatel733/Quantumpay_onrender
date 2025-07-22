const express = require('express');
const router = express.Router();
const { 
  paymentFunction, 
  CoinselectFunction, 
  FinalpayFunction, 
  checkstatus,
  getPaymentDetails,
  validatePaymentRequest 
} = require('../services/payment');

// Coin selection and payment creation
router.post('/coinselect', (req, res) => {
  CoinselectFunction(req, res);
});

// Get payment details for frontend (fix endpoint)
router.get('/payment-details', async (req, res) => {
  getPaymentDetails(req, res);
});

// Check payment status (fix endpoint)
router.get('/check-status', async (req, res) => {
  checkstatus(req, res);
});

// Validate payment request for coin selection (fix endpoint)
router.get('/validate-payment', async (req, res) => {
  validatePaymentRequest(req, res);
});

// Legacy routes for backward compatibility
router.get('/process/:api/:order_id', async (req, res) => {
  const { api, order_id } = req.params;
  paymentFunction(api, order_id, res);
});

// Add missing root route for payment processing
router.get('/:api/:order_id', async (req, res) => {
  const { api, order_id } = req.params;
  paymentFunction(api, order_id, res);
});

// Final payment processing (background)
router.get('/finalize', async (req, res) => {
  FinalpayFunction(req, res);
});

// Mount payment configuration routes
router.use('/config', require('./paymentConfigRoutes'));

module.exports = router;
