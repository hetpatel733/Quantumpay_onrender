import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const RecentActivity = () => {
  const [recentTransactions] = useState([
    {
      id: 'PAY_2024_001234',
      customer: 'Acme Corporation',
      amount: 1250.00,
      cryptocurrency: 'Bitcoin',
      cryptoAmount: 0.03245,
      status: 'completed',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 'PAY_2024_001235',
      customer: 'TechStart Inc.',
      amount: 850.75,
      cryptocurrency: 'Ethereum',
      cryptoAmount: 0.4521,
      status: 'pending',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 'PAY_2024_001236',
      customer: 'Global Solutions Ltd',
      amount: 2100.00,
      cryptocurrency: 'USDT',
      cryptoAmount: 2100.00,
      status: 'completed',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 'PAY_2024_001237',
      customer: 'Digital Ventures',
      amount: 675.25,
      cryptocurrency: 'Bitcoin',
      cryptoAmount: 0.01852,
      status: 'failed',
      timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 'PAY_2024_001238',
      customer: 'Innovation Hub',
      amount: 1800.50,
      cryptocurrency: 'Ethereum',
      cryptoAmount: 0.9876,
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          color: 'text-success',
          bgColor: 'bg-success-100',
          icon: 'CheckCircle',
          label: 'Completed'
        };
      case 'pending':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning-100 pulse-pending',
          icon: 'Clock',
          label: 'Pending'
        };
      case 'failed':
        return {
          color: 'text-error',
          bgColor: 'bg-error-100',
          icon: 'XCircle',
          label: 'Failed'
        };
      default:
        return {
          color: 'text-text-secondary',
          bgColor: 'bg-secondary-100',
          icon: 'HelpCircle',
          label: 'Unknown'
        };
    }
  };

  const getCryptoIcon = (crypto) => {
    switch (crypto.toLowerCase()) {
      case 'bitcoin':
        return 'Bitcoin';
      case 'ethereum':
        return 'Zap'; // Using Zap as placeholder for Ethereum
      case 'usdt':
        return 'DollarSign';
      default:
        return 'Coins';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleTransactionClick = (transactionId) => {
    // Navigate to payment details with from parameter to know where to return
    window.location.href = `/dashboard/payment-details-modal?id=${transactionId}&from=dashboard`;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
          <p className="text-text-secondary text-sm">Latest payment transactions</p>
        </div>
        <Link
          to="/dashboard/payments-management"
          className="
            flex items-center space-x-2 px-4 py-2
            text-primary hover:bg-primary-50 rounded-lg
            transition-smooth font-medium text-sm
          "
        >
          <span>View All</span>
          <Icon name="ArrowRight" size={16} color="currentColor" />
        </Link>
      </div>

      <div className="space-y-4">
        {recentTransactions.map((transaction) => {
          const statusConfig = getStatusConfig(transaction.status);
          
          return (
            <div
              key={transaction.id}
              onClick={() => handleTransactionClick(transaction.id)}
              className="
                flex items-center space-x-4 p-4 rounded-lg
                hover:bg-background transition-smooth cursor-pointer
                border border-transparent hover:border-border
              "
            >
              {/* Customer Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-100">
                  <img
                    src={transaction.avatar}
                    alt={transaction.customer}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-primary rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                    <span className="text-white text-sm font-medium">
                      {transaction.customer.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-text-primary font-medium truncate">
                    {transaction.customer}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getCryptoIcon(transaction.cryptocurrency)} 
                      size={16} 
                      color="var(--color-text-secondary)"
                    />
                    <span className="text-text-primary font-medium">
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-text-secondary text-sm">
                      {transaction.cryptoAmount} {transaction.cryptocurrency}
                    </span>
                    <span className="text-text-secondary text-sm">•</span>
                    <span className="text-text-secondary text-sm">
                      {formatTimeAgo(transaction.timestamp)}
                    </span>
                  </div>
                  
                  <div className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${statusConfig.color} ${statusConfig.bgColor}
                  `}>
                    <Icon 
                      name={statusConfig.icon} 
                      size={12} 
                      color="currentColor"
                      className="mr-1"
                    />
                    {statusConfig.label}
                  </div>
                </div>
              </div>

              {/* Action Arrow */}
              <div className="flex-shrink-0">
                <Icon 
                  name="ChevronRight" 
                  size={16} 
                  color="var(--color-text-secondary)"
                  className="opacity-0 group-hover:opacity-100 transition-smooth"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (if no transactions) */}
      {recentTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Activity" size={32} color="var(--color-text-secondary)" />
          </div>
          <h3 className="text-text-primary font-medium mb-2">No Recent Activity</h3>
          <p className="text-text-secondary text-sm mb-4">
            Your recent transactions will appear here once you start processing payments.
          </p>
          <Link
            to="/payments-management"
            className="
              inline-flex items-center space-x-2 px-4 py-2
              bg-primary text-white rounded-lg
              hover:bg-primary-700 transition-smooth
              font-medium text-sm
            "
          >
            <Icon name="Plus" size={16} color="currentColor" />
            <span>Create Payment</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;