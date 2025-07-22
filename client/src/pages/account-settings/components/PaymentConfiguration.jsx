import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { paymentConfigAPI } from 'utils/api';

const PaymentConfiguration = () => {
  const [supportedCryptos, setSupportedCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [conversionSettings, setConversionSettings] = useState({
    autoConvert: false,
    baseCurrency: 'USD',
    conversionRate: 'real-time',
    slippageTolerance: 1.0
  });

  const [transactionLimits, setTransactionLimits] = useState({
    minAmount: 10,
    maxAmount: 50000,
    dailyLimit: 100000,
    monthlyLimit: 1000000
  });

  const baseCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  const conversionRates = ['real-time', 'hourly-average', 'daily-average'];

  // Fetch payment configurations on component mount
  useEffect(() => {
    fetchPaymentConfigurations();
  }, []);

  const fetchPaymentConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching payment configurations...');
      
      const response = await paymentConfigAPI.getConfig();
      
      console.log('📦 Response received:', response);
      
      if (response.success) {
        const config = response.configuration;
        
        // Handle both old array format and new embedded document format
        let cryptoConfigs = [];
        
        if (config && config.cryptoConfigurations) {
          // New format with embedded documents
          cryptoConfigs = config.cryptoConfigurations.map(crypto => ({
            id: `${config._id}_${crypto.coinType}`,
            coinType: crypto.coinType,
            name: getCryptoName(crypto.coinType),
            symbol: crypto.coinType,
            enabled: crypto.enabled,
            address: crypto.address || '',
            label: crypto.label,
            network: crypto.network
          }));
          
          // Set global settings from configuration
          setConversionSettings(config.conversionSettings || {
            autoConvert: false,
            baseCurrency: 'USD',
            conversionRate: 'real-time',
            slippageTolerance: 1.0
          });
          setTransactionLimits(config.transactionLimits || {
            minAmount: 10,
            maxAmount: 50000,
            dailyLimit: 100000,
            monthlyLimit: 1000000
          });
        } else if (Array.isArray(response.configurations)) {
          // Old format with separate documents
          cryptoConfigs = response.configurations.map(config => ({
            id: config._id,
            coinType: config.coinType,
            name: getCryptoName(config.coinType),
            symbol: config.coinType,
            enabled: config.enabled,
            address: config.address || '',
            label: config.label,
            network: config.network
          }));
        } else {
          // No configuration found, create default UI structure
          cryptoConfigs = [
            {
              id: 'default_USDT',
              coinType: 'USDT',
              name: 'Tether',
              symbol: 'USDT',
              enabled: false,
              address: '',
              label: 'USDT Configuration',
              network: 'Polygon'
            },
            {
              id: 'default_BTC',
              coinType: 'BTC',
              name: 'Bitcoin',
              symbol: 'BTC',
              enabled: false,
              address: '',
              label: 'Bitcoin Configuration',
              network: 'Bitcoin'
            },
            {
              id: 'default_ETH',
              coinType: 'ETH',
              name: 'Ethereum',
              symbol: 'ETH',
              enabled: false,
              address: '',
              label: 'Ethereum Configuration',
              network: 'Ethereum'
            },
            {
              id: 'default_MATIC',
              coinType: 'MATIC',
              name: 'Polygon',
              symbol: 'MATIC',
              enabled: false,
              address: '',
              label: 'Polygon Native Token',
              network: 'Polygon'
            },
            {
              id: 'default_PYUSD',
              coinType: 'PYUSD',
              name: 'PayPal USD',
              symbol: 'PYUSD',
              enabled: false,
              address: '',
              label: 'PayPal USD Configuration',
              network: 'Polygon'
            }
          ];
        }
        
        setSupportedCryptos(cryptoConfigs);
        console.log('✅ Configurations loaded:', cryptoConfigs.length);
        
      } else if (response.message && response.message.includes('business accounts')) {
        // Handle non-business users
        setSupportedCryptos([]);
        setError('Payment configurations are only available for business accounts');
      } else {
        setError(response.message || 'Failed to fetch payment configurations');
      }
    } catch (err) {
      console.error('❌ Error fetching payment configurations:', err);
      setError('Failed to load payment configurations. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const getCryptoName = (coinType) => {
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

  const toggleCrypto = async (cryptoId) => {
    try {
      setSaving(true);
      const crypto = supportedCryptos.find(c => c.id === cryptoId);
      if (!crypto) return;

      // Check if user is trying to enable without address - show warning but allow
      if (!crypto.enabled && (!crypto.address || crypto.address.trim() === '')) {
        const confirmed = window.confirm(
          `You're enabling ${crypto.symbol} without a wallet address. You'll need to add a wallet address and save changes to receive payments. Continue?`
        );
        if (!confirmed) {
          setSaving(false);
          return;
        }
      }

      // Extract coinType from cryptoId (handle both default_ prefix and direct coinType)
      const coinType = cryptoId.includes('_') ? cryptoId.split('_')[1] : crypto.coinType;

      const response = await paymentConfigAPI.toggleCrypto(coinType, !crypto.enabled);

      if (response.success) {
        setSupportedCryptos(prev =>
          prev.map(c =>
            c.id === cryptoId
              ? { ...c, enabled: !c.enabled }
              : c
          )
        );
        setSuccessMessage(`${crypto.symbol} ${!crypto.enabled ? 'enabled' : 'disabled'} successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Failed to update cryptocurrency status');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error toggling crypto:', err);
      setError('Failed to update cryptocurrency status');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const updateWalletAddress = (cryptoId, address) => {
    // Update locally only - don't save to server immediately
    setSupportedCryptos(prev =>
      prev.map(crypto =>
        crypto.id === cryptoId
          ? { ...crypto, address, hasUnsavedChanges: true }
          : crypto
      )
    );
  };

  const handleConversionChange = (field, value) => {
    setConversionSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLimitChange = (field, value) => {
    setTransactionLimits(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const saveGlobalSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      // Check for enabled cryptos without addresses
      const enabledWithoutAddress = supportedCryptos.filter(crypto => 
        crypto.enabled && (!crypto.address || crypto.address.trim() === '')
      );

      if (enabledWithoutAddress.length > 0) {
        const cryptoNames = enabledWithoutAddress.map(c => c.symbol).join(', ');
        setError(`Please add wallet addresses for enabled cryptocurrencies: ${cryptoNames}`);
        setSaving(false);
        return;
      }

      // Save all wallet addresses first
      const addressUpdatePromises = supportedCryptos
        .filter(crypto => crypto.hasUnsavedChanges || crypto.address)
        .map(async (crypto) => {
          const coinType = crypto.id.includes('_') ? crypto.id.split('_')[1] : crypto.coinType;
          return paymentConfigAPI.updateConfig(coinType, {
            address: crypto.address
          });
        });

      // Wait for all address updates
      const addressResults = await Promise.all(addressUpdatePromises);
      const failedAddressUpdates = addressResults.filter(result => !result.success);
      
      if (failedAddressUpdates.length > 0) {
        throw new Error('Failed to update some wallet addresses');
      }

      // Update conversion settings
      const conversionResponse = await paymentConfigAPI.updateGlobalConversionSettings(conversionSettings);
      
      if (!conversionResponse.success) {
        throw new Error(conversionResponse.message || 'Failed to update conversion settings');
      }

      // Update transaction limits
      const limitsResponse = await paymentConfigAPI.updateGlobalTransactionLimits(transactionLimits);
      
      if (!limitsResponse.success) {
        throw new Error(limitsResponse.message || 'Failed to update transaction limits');
      }

      // Clear unsaved changes flags
      setSupportedCryptos(prev =>
        prev.map(crypto => ({
          ...crypto,
          hasUnsavedChanges: false
        }))
      );

      setSuccessMessage('All settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh configurations to get updated data
      await fetchPaymentConfigurations();
      
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = supportedCryptos.some(crypto => crypto.hasUnsavedChanges);

  const resetToDefaults = () => {
    setConversionSettings({
      autoConvert: false,
      baseCurrency: 'USD',
      conversionRate: 'real-time',
      slippageTolerance: 1.0
    });
    setTransactionLimits({
      minAmount: 10,
      maxAmount: 50000,
      dailyLimit: 100000,
      monthlyLimit: 1000000
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Address copied to clipboard');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Payment Configuration</h2>
        <p className="text-text-secondary mt-1">
          Manage supported cryptocurrencies, wallet addresses, and transaction settings
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} color="#10b981" />
            <p className="text-sm text-success-700">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="#ef4444" />
            <p className="text-sm text-error-700">{error}</p>
            {error && typeof error === 'string' && error.includes('business accounts') && (
              <div className="mt-2">
                <p className="text-xs text-error-600">
                  Only business accounts can configure cryptocurrency payment methods.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-text-secondary">Loading payment configurations...</span>
          </div>
        </div>
      )}

      {/* Supported Cryptocurrencies - Always show if not loading and not error for non-business */}
      {!loading && !(error && typeof error === 'string' && error.includes('business accounts')) && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Supported Cryptocurrencies</h3>
          <div className="space-y-4">
            {supportedCryptos.map((crypto) => (
              <div
                key={crypto.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-text-primary">{crypto.symbol}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{crypto.name}</h4>
                    <p className="text-sm text-text-secondary">{crypto.symbol} • {crypto.network}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${crypto.enabled ? 'text-success' : 'text-text-secondary'}`}>
                      {crypto.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => toggleCrypto(crypto.id)}
                      disabled={saving}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                        ${crypto.enabled ? 'bg-success' : 'bg-secondary-300'}
                        disabled:opacity-50
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                          ${crypto.enabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Addresses - Always show, regardless of enabled status */}
      {!loading && supportedCryptos.length > 0 && !(error && typeof error === 'string' && error.includes('business accounts')) && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Wallet Addresses</h3>
          <p className="text-text-secondary text-sm mb-4">
            Configure wallet addresses for receiving cryptocurrency payments. You can add addresses even before enabling a cryptocurrency.
          </p>
          <div className="space-y-4">
            {supportedCryptos.map((crypto) => (
              <div key={crypto.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-text-secondary">
                    {crypto.name} ({crypto.symbol}) Wallet Address
                  </label>
                  {crypto.enabled && (
                    <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full">
                      Enabled
                    </span>
                  )}
                  {crypto.hasUnsavedChanges && (
                    <span className="text-xs bg-warning-100 text-warning-700 px-2 py-1 rounded-full">
                      Unsaved changes
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={crypto.address}
                    onChange={(e) => updateWalletAddress(crypto.id, e.target.value)}
                    className="
                      flex-1 px-3 py-2 border border-border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                      text-text-primary bg-background font-mono text-sm
                    "
                    placeholder={`Enter your ${crypto.symbol} wallet address`}
                  />
                  {crypto.address && (
                    <button
                      onClick={() => copyToClipboard(crypto.address)}
                      className="
                        p-2 border border-border rounded-lg
                        hover:bg-secondary-100 transition-smooth
                        text-text-secondary hover:text-text-primary
                      "
                    >
                      <Icon name="Copy" size={16} color="currentColor" />
                    </button>
                  )}
                </div>
                {crypto.enabled && (!crypto.address || crypto.address.trim() === '') && (
                  <p className="text-xs text-warning-600">
                    ⚠️ This cryptocurrency is enabled but has no wallet address. Add an address to receive payments.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversion Settings - Always show if not loading and not business account error */}
      {!loading && !(error && typeof error === 'string' && error.includes('business accounts')) && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Conversion Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Base Currency
              </label>
              <select
                value={conversionSettings.baseCurrency}
                onChange={(e) => handleConversionChange('baseCurrency', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              >
                {baseCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Conversion Rate Source
              </label>
              <select
                value={conversionSettings.conversionRate}
                onChange={(e) => handleConversionChange('conversionRate', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              >
                {conversionRates.map(rate => (
                  <option key={rate} value={rate}>
                    {rate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={conversionSettings.slippageTolerance}
                onChange={(e) => handleConversionChange('slippageTolerance', parseFloat(e.target.value))}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Auto-Convert to Fiat
                </label>
                <p className="text-xs text-text-secondary">
                  Automatically convert crypto payments to your base currency
                </p>
              </div>
              <button
                onClick={() => handleConversionChange('autoConvert', !conversionSettings.autoConvert)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                  ${conversionSettings.autoConvert ? 'bg-success' : 'bg-secondary-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                    ${conversionSettings.autoConvert ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Limits - Always show if not loading and not business account error */}
      {!loading && !(error && typeof error === 'string' && error.includes('business accounts')) && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Transaction Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Minimum Transaction Amount ({conversionSettings.baseCurrency})
              </label>
              <input
                type="number"
                min="1"
                value={transactionLimits.minAmount}
                onChange={(e) => handleLimitChange('minAmount', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Maximum Transaction Amount ({conversionSettings.baseCurrency})
              </label>
              <input
                type="number"
                min="1"
                value={transactionLimits.maxAmount}
                onChange={(e) => handleLimitChange('maxAmount', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Daily Limit ({conversionSettings.baseCurrency})
              </label>
              <input
                type="number"
                min="1"
                value={transactionLimits.dailyLimit}
                onChange={(e) => handleLimitChange('dailyLimit', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Monthly Limit ({conversionSettings.baseCurrency})
              </label>
              <input
                type="number"
                min="1"
                value={transactionLimits.monthlyLimit}
                onChange={(e) => handleLimitChange('monthlyLimit', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Changes - Always show if configurations are available */}
      {!loading && supportedCryptos.length > 0 && !(error && typeof error === 'string' && error.includes('business accounts')) && (
        <div className="flex justify-end space-x-3">
          <button 
            onClick={resetToDefaults}
            disabled={saving}
            className="
              px-4 py-2 border border-border rounded-lg
              text-text-secondary hover:text-text-primary
              hover:bg-secondary-100 transition-smooth
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Reset to Defaults
          </button>
          <button 
            onClick={saveGlobalSettings}
            disabled={saving}
            className={`
              px-6 py-2 rounded-lg transition-smooth
              flex items-center space-x-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${hasUnsavedChanges 
                ? 'bg-warning text-white hover:bg-warning-700' 
                : 'bg-primary text-white hover:bg-primary-700'
              }
            `}
          >
            {saving && <Icon name="Loader2" size={16} color="currentColor" className="animate-spin" />}
            <Icon name="Save" size={16} color="currentColor" />
            <span>
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes*' : 'Save Configuration'}
            </span>
          </button>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
          <p className="text-sm text-warning-700">
            * You have unsaved changes to wallet addresses. Click "Save Changes" to apply them.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentConfiguration;