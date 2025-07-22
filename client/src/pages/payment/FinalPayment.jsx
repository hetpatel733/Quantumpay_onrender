import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from 'components/AppIcon';
import { paymentsAPI } from 'utils/api';
import "../../styles/payment/finalpayment.css";

const FinalPayment = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const payid = params.get('payid');

  const [paymentData, setPaymentData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Helper function to get network name
  const getNetworkName = (cryptoType) => {
    const networks = {
      'BTC': 'Bitcoin Network',
      'ETH': 'Ethereum Network',
      'USDT': 'Multiple Networks',
      'USDC': 'Multiple Networks', 
      'MATIC': 'Polygon Network',
      'PYUSD': 'Polygon Network'
    };
    return networks[cryptoType] || 'Blockchain Network';
  };

  useEffect(() => {
    if (!payid) {
      setError('Payment ID is required');
      setLoading(false);
      return;
    }

    fetchPaymentDetails();
    const statusInterval = setInterval(checkPaymentStatus, 10000); // Check every 10 seconds

    return () => clearInterval(statusInterval);
  }, [payid]);

  const fetchPaymentDetails = async () => {
    try {
      console.log('🔄 Fetching payment details for:', payid);
      
      const data = await paymentsAPI.getDetails(payid);
      console.log('📦 Payment details response:', data);

      if (data.success && data.payment) {
        setPaymentData(data.payment);
        setPaymentStatus(data.payment.status || 'pending');
        
        // Generate QR code only if we have a valid wallet address
        const walletAddress = data.payment.walletAddress || data.payment.address;
        const isValidAddress = walletAddress && 
                              walletAddress !== data.payment.businessEmail && 
                              walletAddress.trim() !== '';
                              
        if (isValidAddress) {
          console.log('🔗 Valid wallet address found, generating QR code for:', walletAddress.substring(0, 10) + '...');
          await generateQRCode(walletAddress, data.payment);
        } else {
          console.warn('⚠️ No valid wallet address found for QR code generation');
          setError('Merchant has not configured a wallet address for this cryptocurrency. Please contact the merchant.');
        }
      } else {
        setError(data.message || 'Payment not found');
      }
    } catch (err) {
      console.error('❌ Failed to fetch payment details:', err);
      
      if (err.message.includes('404')) {
        setError('Payment not found. Please check your payment ID.');
      } else {
        setError('Failed to fetch payment details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (address, payment) => {
    try {
      // Create a proper QR code URL for cryptocurrency payments
      const amount = payment?.amountCrypto || payment?.amount;
      const cryptoType = payment?.cryptoType || payment?.type;
      
      let qrData = address;
      
      // Format QR data based on cryptocurrency type
      if (cryptoType === 'BTC' && amount) {
        qrData = `bitcoin:${address}?amount=${amount}`;
      } else if (cryptoType === 'ETH' && amount) {
        qrData = `ethereum:${address}?value=${amount}`;
      }
      
      // Use QR server API to generate QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=256x256&margin=10`;
      setQrCodeUrl(qrUrl);
      
      console.log('✅ QR code generated for:', cryptoType, 'address');
    } catch (err) {
      console.error('❌ Failed to generate QR code:', err);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const data = await paymentsAPI.checkStatus(payid);
      if (data.success) {
        setPaymentStatus(data.status);
        if (data.status === 'completed') {
          // Payment completed, could redirect or show success message
        }
      }
    } catch (err) {
      // Silent fail for status checks
      console.log('Status check failed:', err);
    }
  };

  const copyAddress = () => {
    const address = paymentData?.walletAddress || paymentData?.address;
    if (address && address !== paymentData?.businessEmail) {
      navigator.clipboard.writeText(address);
      alert('Wallet address copied to clipboard!');
    } else {
      alert('No valid wallet address to copy');
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={32} color="#ef4444" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <img src="/images/Logo.webp" alt="QuantumPay" className="h-10" />
        </div>
      </div>

      {/* Amount Display */}
      <div className="bg-blue-50 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg">
            <span className="text-lg">Amount:</span>
            <span className="text-2xl font-bold">
              {paymentData.amountCrypto || paymentData.amount}
            </span>
            <span className="text-lg">
              {paymentData.cryptoType || paymentData.type}
            </span>
          </div>
          {paymentData.amountUSD && (
            <div className="mt-2 text-gray-600">
              ≈ ${paymentData.amountUSD} USD
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          {/* Payment ID */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Payment ID:</p>
            <p className="font-mono text-lg font-medium text-gray-900">{payid}</p>
          </div>

          {/* Order ID (if available) */}
          {(paymentData.order_id || paymentData.orderId) && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Order ID:</p>
              <p className="font-mono text-md text-gray-900">
                {paymentData.order_id || paymentData.orderId}
              </p>
            </div>
          )}

          {/* Customer Info */}
          {(paymentData.customerName || paymentData.customerEmail) && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-2">Customer Details:</p>
              {paymentData.customerName && (
                <p className="text-gray-900">
                  <strong>Name:</strong> {paymentData.customerName}
                </p>
              )}
              {paymentData.customerEmail && (
                <p className="text-gray-900">
                  <strong>Email:</strong> {paymentData.customerEmail}
                </p>
              )}
            </div>
          )}

          {/* Payment Status */}
          <div className="mb-6">
            {paymentStatus === 'completed' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <Icon name="CheckCircle" size={24} />
                  <span className="text-lg font-medium">Payment Successful!</span>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-yellow-700 mb-2">
                  <Icon name="Clock" size={20} />
                  <span className="font-medium">Waiting for Payment</span>
                </div>
                <p className="text-sm text-gray-600">
                  Do not leave this page. Refresh after making the payment.
                </p>
                <button
                  onClick={refreshPage}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="mb-6">
              <p className="text-gray-600 mb-3">Scan to Pay:</p>
              <img
                src={qrCodeUrl}
                alt="Payment QR Code"
                className="mx-auto border border-gray-200 rounded-lg"
              />
            </div>
          )}

          {/* Address Section - Only show if valid address exists */}
          {(paymentData.walletAddress || paymentData.address) && 
           paymentData.walletAddress !== paymentData.businessEmail && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Send Payment To:</p>
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <input
                  type="text"
                  value={paymentData.walletAddress || paymentData.address}
                  readOnly
                  className="flex-1 bg-transparent text-sm font-mono text-gray-900 outline-none"
                />
                <button
                  onClick={copyAddress}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Copy address"
                >
                  <Icon name="Copy" size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Network: {getNetworkName(paymentData.cryptoType || paymentData.type)}
              </p>
            </div>
          )}

          {/* Show warning if no valid wallet address */}
          {(!paymentData.walletAddress || paymentData.walletAddress === paymentData.businessEmail) && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <Icon name="AlertCircle" size={20} />
                  <div>
                    <p className="font-medium">Payment Cannot Be Processed</p>
                    <p className="text-sm">
                      The merchant hasn't configured a valid wallet address for {paymentData.cryptoType || paymentData.type}. 
                      Please contact the merchant to complete the payment setup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Instructions - Only show for valid addresses */}
          <div className="text-sm text-gray-600 space-y-2">
            {(paymentData.walletAddress && paymentData.walletAddress !== paymentData.businessEmail) ? (
              <>
                <p className="font-medium">Payment Instructions:</p>
                <p>1. Send exactly <strong>{paymentData.amountCrypto || paymentData.amount} {paymentData.cryptoType || paymentData.type}</strong> to the address above</p>
                <p>2. Wait for network confirmation (this may take a few minutes)</p>
                <p>3. This page will automatically update when payment is confirmed</p>
                <p>4. <strong>Do not</strong> send from an exchange - use a personal wallet</p>
                {(paymentData.cryptoType === 'BTC' || paymentData.type === 'BTC') && (
                  <p className="text-xs text-yellow-600 mt-2">
                    ⚠️ Bitcoin transactions may take 10-60 minutes to confirm depending on network congestion
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-600 font-medium">
                  ⚠️ Payment processing unavailable
                </p>
                <p className="text-sm">
                  Please contact the merchant to resolve this issue.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center mt-6">
          <a
            href="/contact"
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            Any issues? Contact Support
          </a>
          <p className="text-xs text-gray-500 mt-1">
            Please save your Payment ID: {payid}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinalPayment;