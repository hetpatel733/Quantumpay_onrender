import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const PaymentConfiguration = () => {
  const [supportedCryptos, setSupportedCryptos] = useState([
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', enabled: true, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', enabled: true, address: '0x742d35Cc6634C0532925a3b8D4C2C4e8C8C8C8C8' },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', enabled: true, address: '0x742d35Cc6634C0532925a3b8D4C2C4e8C8C8C8C8' },
    { id: 'ltc', name: 'Litecoin', symbol: 'LTC', enabled: false, address: '' },
    { id: 'ada', name: 'Cardano', symbol: 'ADA', enabled: false, address: '' }
  ]);

  const [conversionSettings, setConversionSettings] = useState({
    autoConvert: true,
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

  const toggleCrypto = (cryptoId) => {
    setSupportedCryptos(prev =>
      prev.map(crypto =>
        crypto.id === cryptoId
          ? { ...crypto, enabled: !crypto.enabled }
          : crypto
      )
    );
  };

  const updateWalletAddress = (cryptoId, address) => {
    setSupportedCryptos(prev =>
      prev.map(crypto =>
        crypto.id === cryptoId
          ? { ...crypto, address }
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Payment Configuration</h2>
        <p className="text-text-secondary mt-1">
          Manage supported cryptocurrencies, wallet addresses, and transaction settings
        </p>
      </div>

      {/* Supported Cryptocurrencies */}
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
                  <p className="text-sm text-text-secondary">{crypto.symbol}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${crypto.enabled ? 'text-success' : 'text-text-secondary'}`}>
                    {crypto.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleCrypto(crypto.id)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                      ${crypto.enabled ? 'bg-success' : 'bg-secondary-300'}
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

      {/* Wallet Addresses */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Wallet Addresses</h3>
        <p className="text-text-secondary text-sm mb-4">
          Configure wallet addresses for receiving cryptocurrency payments
        </p>
        <div className="space-y-4">
          {supportedCryptos.filter(crypto => crypto.enabled).map((crypto) => (
            <div key={crypto.id} className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">
                {crypto.name} ({crypto.symbol}) Wallet Address
              </label>
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
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Settings */}
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

      {/* Transaction Limits */}
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

      {/* Save Changes */}
      <div className="flex justify-end space-x-3">
        <button className="
          px-4 py-2 border border-border rounded-lg
          text-text-secondary hover:text-text-primary
          hover:bg-secondary-100 transition-smooth
        ">
          Reset to Defaults
        </button>
        <button className="
          px-6 py-2 bg-primary text-white rounded-lg
          hover:bg-primary-700 transition-smooth
          flex items-center space-x-2
        ">
          <Icon name="Save" size={16} color="currentColor" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentConfiguration;