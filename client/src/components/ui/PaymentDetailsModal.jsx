import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../AppIcon';

const PaymentDetailsModal = ({ 
  isOpen, 
  onClose, 
  paymentData = null 
}) => {
  const modalRef = useRef(null);

  // Sample payment data for demonstration
  const defaultPaymentData = {
    id: 'PAY_2024_001234',
    amount: 1250.00,
    currency: 'USD',
    status: 'completed',
    customer: {
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      id: 'CUST_789456'
    },
    cryptocurrency: {
      type: 'Bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      amount: 0.03245,
      confirmations: 6,
      txHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'
    },
    timestamps: {
      created: '2024-01-15T10:30:00Z',
      completed: '2024-01-15T10:45:00Z'
    },
    fees: {
      network: 0.0001,
      platform: 12.50
    }
  };

  const payment = paymentData || defaultPaymentData;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success-100';
      case 'pending':
        return 'text-warning bg-warning-100 pulse-pending';
      case 'failed':
        return 'text-error bg-error-100';
      default:
        return 'text-text-secondary bg-secondary-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Handle escape key and backdrop click
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleBackdropClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleBackdropClick);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleBackdropClick);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-smooth" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="
          relative bg-surface rounded-lg shadow-dropdown
          w-full max-w-2xl max-h-[90vh] overflow-hidden
          transition-layout
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="FileText" size={24} color="currentColor" className="text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Payment Details</h2>
              <p className="text-sm text-text-secondary">Transaction ID: {payment.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              hover:bg-secondary-100 transition-smooth
              text-text-secondary hover:text-text-primary
            "
          >
            <Icon name="X" size={20} color="currentColor" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Status and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <div className={`
                  inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${getStatusColor(payment.status)}
                `}>
                  <Icon 
                    name={payment.status === 'completed' ? 'CheckCircle' : 
                          payment.status === 'pending' ? 'Clock' : 'XCircle'} 
                    size={16} 
                    color="currentColor"
                    className="mr-1.5"
                  />
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Amount
                </label>
                <p className="text-2xl font-semibold text-text-primary">
                  ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-text-secondary">{payment.currency}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">Customer Information</h3>
              <div className="bg-background rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Customer Name
                    </label>
                    <p className="text-text-primary">{payment.customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Email Address
                    </label>
                    <p className="text-text-primary">{payment.customer.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Customer ID
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-sm text-text-primary bg-surface px-2 py-1 rounded border">
                      {payment.customer.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(payment.customer.id)}
                      className="p-1 hover:bg-secondary-100 rounded transition-smooth"
                    >
                      <Icon name="Copy" size={16} color="currentColor" className="text-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptocurrency Details */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">Cryptocurrency Details</h3>
              <div className="bg-background rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Currency Type
                    </label>
                    <p className="text-text-primary">{payment.cryptocurrency.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Amount
                    </label>
                    <p className="font-mono text-text-primary">{payment.cryptocurrency.amount} BTC</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Wallet Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-sm text-text-primary bg-surface px-2 py-1 rounded border flex-1 break-all">
                      {payment.cryptocurrency.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(payment.cryptocurrency.address)}
                      className="p-1 hover:bg-secondary-100 rounded transition-smooth flex-shrink-0"
                    >
                      <Icon name="Copy" size={16} color="currentColor" className="text-text-secondary" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Transaction Hash
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-sm text-text-primary bg-surface px-2 py-1 rounded border flex-1 break-all">
                      {payment.cryptocurrency.txHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(payment.cryptocurrency.txHash)}
                      className="p-1 hover:bg-secondary-100 rounded transition-smooth flex-shrink-0"
                    >
                      <Icon name="Copy" size={16} color="currentColor" className="text-text-secondary" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Confirmations
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-text-primary">{payment.cryptocurrency.confirmations}/6</span>
                    <div className="flex-1 bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full transition-layout"
                        style={{ width: `${(payment.cryptocurrency.confirmations / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">Transaction Timeline</h3>
              <div className="bg-background rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Payment Created</p>
                    <p className="text-xs text-text-secondary">{formatDate(payment.timestamps.created)}</p>
                  </div>
                </div>
                {payment.timestamps.completed && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">Payment Completed</p>
                      <p className="text-xs text-text-secondary">{formatDate(payment.timestamps.completed)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fees */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">Fee Breakdown</h3>
              <div className="bg-background rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Network Fee</span>
                  <span className="font-mono text-text-primary">{payment.fees.network} BTC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Platform Fee</span>
                  <span className="font-mono text-text-primary">${payment.fees.platform}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="
              px-4 py-2 border border-border rounded-lg
              text-text-secondary hover:text-text-primary
              hover:bg-secondary-100 transition-smooth
            "
          >
            Close
          </button>
          <button className="
            px-4 py-2 bg-primary text-white rounded-lg
            hover:bg-primary-700 transition-smooth
            flex items-center space-x-2
          ">
            <Icon name="Download" size={16} color="currentColor" />
            <span>Export Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentDetailsModal;