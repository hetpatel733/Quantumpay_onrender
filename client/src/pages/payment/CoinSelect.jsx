import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from 'components/AppIcon';
import { paymentsAPI } from 'utils/api';
import "../../styles/payment/coinselect.css";

const CoinSelect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    type: ''
  });
  const [orderData, setOrderData] = useState(null);
  const [enabledCryptos, setEnabledCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = new URLSearchParams(location.search);
  const api = params.get('api');
  const order_id = params.get('order_id');

  // Crypto display data for images only
  const cryptoDisplayData = {
    'BTC': { 
      image: '/images/Coins/BTC.webp', 
      network: 'Bitcoin',
      name: 'Bitcoin'
    },
    'ETH': { 
      image: '/images/Coins/ETH.webp', 
      network: 'Ethereum',
      name: 'Ethereum'
    },
    'USDT': { 
      image: '/images/Coins/USDT.webp', 
      network: 'Various',
      name: 'Tether'
    },
    'USDC': { 
      image: '/images/Coins/USDC.PNG', 
      network: 'Various',
      name: 'USD Coin'
    },
    'MATIC': { 
      image: '/images/Coins/MATIC.webp', 
      network: 'Polygon',
      name: 'Polygon'
    },
    'PYUSD': { 
      image: '/images/Coins/USDT.webp', 
      network: 'Polygon',
      name: 'PayPal USD'
    }
  };

  const getNetworkDisplayName = (network) => {
    const networkNames = {
      'Bitcoin': 'Bitcoin Network',
      'Ethereum': 'Ethereum Network', 
      'Polygon': 'Polygon Network',
      'BSC': 'Binance Smart Chain',
      'TRON': 'TRON Network',
      'Solana': 'Solana Network'
    };
    return networkNames[network] || network;
  };

  // Group enabled cryptos by network - only use data from backend
  const getNetworkGroups = () => {
    const groups = {};
    
    // Only process cryptocurrencies that came from the backend
    enabledCryptos.forEach(crypto => {
      const network = crypto.network || 'Other';
      if (!groups[network]) {
        groups[network] = [];
      }
      
      // Merge backend data with display data
      const displayData = cryptoDisplayData[crypto.coinType] || {};
      
      groups[network].push({
        ...crypto,
        image: displayData.image || '/images/Coins/default.webp',
        displayName: crypto.name || displayData.name || crypto.coinType,
        displayNetwork: getNetworkDisplayName(network)
      });
    });
    
    return groups;
  };

  useEffect(() => {
    if (!api || !order_id) {
      setError('Missing API key or Order ID');
      setLoading(false);
      return;
    }

    validatePaymentRequest();
  }, [api, order_id]);

  const validatePaymentRequest = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Validating payment request...');
      
      const data = await paymentsAPI.validatePayment(api, order_id);
      console.log('📦 Validation response:', data);

      if (data.success) {
        setOrderData(data.order);
        
        // Only set enabled cryptos from backend response
        const backendCryptos = data.enabledCryptos || [];
        setEnabledCryptos(backendCryptos);
        
        console.log(`✅ Found ${backendCryptos.length} enabled cryptocurrencies`);
        
        if (backendCryptos.length === 0) {
          setError('No payment methods are currently enabled by the merchant. Please contact support.');
        }
      } else {
        setError(data.message || 'Invalid payment request');
      }
    } catch (err) {
      console.error('❌ Validation error:', err);
      setError('Failed to validate payment request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCryptoSelect = (cryptoType) => {
    console.log('💰 Crypto selected:', cryptoType);
    setFormData(prev => ({
      ...prev,
      type: cryptoType
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.fname.trim() || !formData.lname.trim() || !formData.email.trim() || !formData.type) {
      setError('Please fill in all fields and select a cryptocurrency');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate selected crypto is from enabled list
    const selectedCrypto = enabledCryptos.find(crypto => crypto.coinType === formData.type);
    if (!selectedCrypto) {
      setError('Selected cryptocurrency is not available. Please choose from the enabled options.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🚀 Submitting payment with data:', {
        ...formData,
        api,
        order_id,
        selectedCrypto: selectedCrypto.coinType
      });

      const data = await paymentsAPI.processCoinSelection({
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        email: formData.email.trim(),
        type: formData.type,
        api,
        order_id
      });

      console.log('📤 Payment creation response:', data);
      
      if (data.success && data.payid) {
        console.log('✅ Payment created successfully, redirecting to:', data.payid);
        navigate(`/payment/final-payment?payid=${data.payid}`);
      } else {
        setError(data.message || 'Payment processing failed. Please try again.');
      }

    } catch (err) {
      console.error('❌ Payment submission error:', err);
      
      if (err.message.includes('404')) {
        setError('Payment service not available. Please contact support.');
      } else if (err.message.includes('non-JSON')) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError('Network error occurred. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  // Error state with no order data
  if (error && !orderData) {
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

  const networkGroups = getNetworkGroups();

  return (
    <div className="payment-container">
      {/* Header */}
      <div className="payment-header">
        <div className="max-w-4xl mx-auto flex items-center">
          <img src="/images/Logo.webp" alt="QuantumPay" className="h-10" />
        </div>
      </div>

      {/* Amount Display */}
      <div className="amount-display">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg">
            <span className="text-lg">Amount:</span>
            <span className="text-2xl font-bold">${orderData?.amount}</span>
          </div>
          {orderData?.productName && (
            <div className="mt-2 text-gray-600">
              {orderData.productName}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Buyer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Buyer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="fname"
                placeholder="First Name"
                value={formData.fname}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <input
                type="text"
                name="lname"
                placeholder="Last Name"
                value={formData.lname}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Cryptocurrency Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Cryptocurrency</h2>
            
            {enabledCryptos.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="AlertCircle" size={32} color="#6b7280" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods Available</h3>
                <p className="text-gray-600 mb-4">
                  The merchant hasn't enabled any cryptocurrency payment methods yet.
                </p>
                <p className="text-sm text-gray-500">
                  Please contact the merchant or try again later.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(networkGroups).map(([networkName, cryptos]) => (
                  <div key={networkName}>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {getNetworkDisplayName(networkName)}
                    </h3>
                    <div className="crypto-grid">
                      {cryptos.map((crypto) => (
                        <label
                          key={crypto.coinType}
                          className={`crypto-card ${formData.type === crypto.coinType ? 'selected' : ''} ${isSubmitting ? 'pointer-events-none opacity-75' : ''}`}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={crypto.coinType}
                            checked={formData.type === crypto.coinType}
                            onChange={() => handleCryptoSelect(crypto.coinType)}
                            disabled={isSubmitting}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <img
                              src={crypto.image}
                              alt={crypto.displayName}
                              className="crypto-image"
                              onError={(e) => {
                                e.target.src = '/images/Coins/default.webp';
                              }}
                            />
                            <p className="text-sm font-medium text-gray-900">{crypto.displayName}</p>
                            <p className="text-xs text-gray-500">{crypto.symbol}</p>
                          </div>
                          {formData.type === crypto.coinType && (
                            <div className="absolute top-2 right-2">
                              <Icon name="CheckCircle" size={20} color="#2563eb" />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} color="#ef4444" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {enabledCryptos.length > 0 && (
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || !formData.type || !formData.fname.trim() || !formData.lname.trim() || !formData.email.trim()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{isSubmitting ? 'Processing...' : 'Complete Checkout'}</span>
              </button>
              
              {formData.type && (
                <p className="text-sm text-gray-500 mt-2">
                  You will pay with {enabledCryptos.find(c => c.coinType === formData.type)?.name || formData.type}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CoinSelect;