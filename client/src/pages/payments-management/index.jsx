import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from 'components/AppIcon';

import PaymentDetailsModal from 'components/ui/PaymentDetailsModal';

const PaymentsManagement = () => {
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    cryptocurrency: 'all',
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Mock payment data
  const mockPayments = [
    {
      id: 'PAY_2024_001234',
      amount: 1250.00,
      cryptocurrency: { type: 'Bitcoin', symbol: 'BTC', amount: 0.03245 },
      recipient: 'Acme Corporation',
      recipientEmail: 'billing@acme.com',
      status: 'completed',
      timestamp: new Date('2024-01-15T10:45:00Z'),
      fees: { network: 0.0001, platform: 12.50 },
      txHash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'
    },
    {
      id: 'PAY_2024_001235',
      amount: 750.50,
      cryptocurrency: { type: 'Ethereum', symbol: 'ETH', amount: 0.4521 },
      recipient: 'TechStart Inc',
      recipientEmail: 'payments@techstart.com',
      status: 'pending',
      timestamp: new Date('2024-01-15T09:30:00Z'),
      fees: { network: 0.002, platform: 7.51 },
      txHash: '0x742d35cc6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c'
    },
    {
      id: 'PAY_2024_001236',
      amount: 2100.00,
      cryptocurrency: { type: 'USDT', symbol: 'USDT', amount: 2100.00 },
      recipient: 'Global Solutions Ltd',
      recipientEmail: 'finance@globalsolutions.com',
      status: 'failed',
      timestamp: new Date('2024-01-15T08:15:00Z'),
      fees: { network: 1.00, platform: 21.00 },
      txHash: 'TRX_failed_transaction_hash_example'
    },
    {
      id: 'PAY_2024_001237',
      amount: 890.25,
      cryptocurrency: { type: 'Bitcoin', symbol: 'BTC', amount: 0.02314 },
      recipient: 'Digital Marketing Pro',
      recipientEmail: 'billing@digitalmarketing.pro',
      status: 'completed',
      timestamp: new Date('2024-01-14T16:20:00Z'),
      fees: { network: 0.0001, platform: 8.90 },
      txHash: '00000000000000000007abd8d2a16a69c1c0e8e8e8e8e8e8e8e8e8e8e8e8e8e8'
    },
    {
      id: 'PAY_2024_001238',
      amount: 3250.75,
      cryptocurrency: { type: 'Ethereum', symbol: 'ETH', amount: 1.9654 },
      recipient: 'Enterprise Corp',
      recipientEmail: 'accounts@enterprise.corp',
      status: 'pending',
      timestamp: new Date('2024-01-14T14:45:00Z'),
      fees: { network: 0.003, platform: 32.51 },
      txHash: '0x123d35cc6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c'
    },
    {
      id: 'PAY_2024_001239',
      amount: 567.80,
      cryptocurrency: { type: 'USDT', symbol: 'USDT', amount: 567.80 },
      recipient: 'Startup Ventures',
      recipientEmail: 'pay@startupventures.io',
      status: 'completed',
      timestamp: new Date('2024-01-14T12:30:00Z'),
      fees: { network: 0.50, platform: 5.68 },
      txHash: 'TRX_completed_transaction_hash_567_example'
    },
    {
      id: 'PAY_2024_001240',
      amount: 1875.40,
      cryptocurrency: { type: 'Bitcoin', symbol: 'BTC', amount: 0.04876 },
      recipient: 'Creative Agency',
      recipientEmail: 'billing@creativeagency.design',
      status: 'failed',
      timestamp: new Date('2024-01-14T10:15:00Z'),
      fees: { network: 0.0001, platform: 18.75 },
      txHash: '00000000000000000008def9e3b27b7ac2d1f9f9f9f9f9f9f9f9f9f9f9f9f9'
    },
    {
      id: 'PAY_2024_001241',
      amount: 4200.00,
      cryptocurrency: { type: 'Ethereum', symbol: 'ETH', amount: 2.5432 },
      recipient: 'Manufacturing Solutions',
      recipientEmail: 'finance@manufacturing.solutions',
      status: 'completed',
      timestamp: new Date('2024-01-13T18:45:00Z'),
      fees: { network: 0.004, platform: 42.00 },
      txHash: '0x456d35cc6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c6e4c4e0c'
    }
  ];

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

  const getCryptoIcon = (type) => {
    switch (type) {
      case 'Bitcoin':
        return 'Bitcoin';
      case 'Ethereum':
        return 'Zap';
      case 'USDT':
        return 'DollarSign';
      default:
        return 'Coins';
    }
  };

  // Filter and sort payments
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = mockPayments.filter(payment => {
      const matchesStatus = filters.status === 'all' || payment.status === filters.status;
      const matchesCrypto = filters.cryptocurrency === 'all' || payment.cryptocurrency.type === filters.cryptocurrency;
      const matchesSearch = !filters.search || 
        payment.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.recipient.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesDateRange = (!filters.dateRange.start || payment.timestamp >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end || payment.timestamp <= new Date(filters.dateRange.end));
      
      const matchesAmountRange = (!filters.amountRange.min || payment.amount >= parseFloat(filters.amountRange.min)) &&
        (!filters.amountRange.max || payment.amount <= parseFloat(filters.amountRange.max));

      return matchesStatus && matchesCrypto && matchesSearch && matchesDateRange && matchesAmountRange;
    });

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'timestamp') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [mockPayments, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPayments.length / itemsPerPage);
  const paginatedPayments = filteredAndSortedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === paginatedPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(paginatedPayments.map(p => p.id));
    }
  };

  // Read payment ID from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentId = params.get('id');
    
    if (paymentId) {
      // Find the payment with this ID
      const payment = mockPayments.find(p => p.id === paymentId);
      if (payment) {
        setSelectedPayment(payment);
        setIsModalOpen(true);
      }
    }
  }, [location.search]); // Re-run when URL changes

  // Modified to use payment-details-modal route with from parameter
  const handleViewDetails = (payment) => {
    // Navigate to payment details modal with from parameter to know where to return
    navigate(`/dashboard/payment-details-modal?id=${payment.id}&from=payments`);
  };
  
  // Handle modal close by removing ID from URL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate('/dashboard/payments-management', { replace: true });
  };

  const handleBulkExport = () => {
    console.log('Exporting selected payments:', selectedPayments);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-background min-h-screen overflow-x-hidden max-w-full">
      <div className="max-w-8xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-text-primary">Payments Management</h1>
              <p className="text-text-secondary mt-1">Monitor and manage all cryptocurrency transactions</p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedPayments.length > 0 && (
                <button
                  onClick={handleBulkExport}
                  className="
                    flex items-center space-x-2 px-4 py-2
                    bg-secondary-100 text-text-primary rounded-lg
                    hover:bg-secondary-200 transition-smooth
                  "
                >
                  <Icon name="Download" size={16} color="currentColor" />
                  <span>Export Selected ({selectedPayments.length})</span>
                </button>
              )}
              <button className="
                flex items-center space-x-2 px-4 py-2
                bg-primary text-white rounded-lg
                hover:bg-primary-700 transition-smooth
              ">
                <Icon name="Plus" size={16} color="currentColor" />
                <span>Create Payment Link</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Payments</p>
                  <p className="text-2xl font-semibold text-text-primary">{mockPayments.length}</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon name="CreditCard" size={20} color="var(--color-primary)" />
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Completed</p>
                  <p className="text-2xl font-semibold text-success">
                    {mockPayments.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Pending</p>
                  <p className="text-2xl font-semibold text-warning">
                    {mockPayments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} color="var(--color-warning)" />
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Failed</p>
                  <p className="text-2xl font-semibold text-error">
                    {mockPayments.filter(p => p.status === 'failed').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
                  <Icon name="XCircle" size={20} color="var(--color-error)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search
              </label>
              <div className="relative">
                <Icon 
                  name="Search" 
                  size={16} 
                  color="currentColor"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  placeholder="Search by ID or recipient..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="
                    w-full pl-10 pr-4 py-2
                    bg-background border border-border rounded-lg
                    text-text-primary placeholder-text-secondary
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-smooth
                  "
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="
                  w-full px-3 py-2
                  bg-background border border-border rounded-lg
                  text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-smooth
                "
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Cryptocurrency Filter */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Cryptocurrency
              </label>
              <select
                value={filters.cryptocurrency}
                onChange={(e) => setFilters(prev => ({ ...prev, cryptocurrency: e.target.value }))}
                className="
                  w-full px-3 py-2
                  bg-background border border-border rounded-lg
                  text-text-primary
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-smooth
                "
              >
                <option value="all">All Crypto</option>
                <option value="Bitcoin">Bitcoin</option>
                <option value="Ethereum">Ethereum</option>
                <option value="USDT">USDT</option>
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Min Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.amountRange.min}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amountRange: { ...prev.amountRange, min: e.target.value }
                }))}
                className="
                  w-full px-3 py-2
                  bg-background border border-border rounded-lg
                  text-text-primary placeholder-text-secondary
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-smooth
                "
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary">
              Showing {filteredAndSortedPayments.length} of {mockPayments.length} payments
            </p>
            <button
              onClick={() => setFilters({
                status: 'all',
                cryptocurrency: 'all',
                dateRange: { start: '', end: '' },
                amountRange: { min: '', max: '' },
                search: ''
              })}
              className="
                flex items-center space-x-2 px-3 py-1.5
                text-text-secondary hover:text-text-primary
                hover:bg-secondary-100 rounded-lg transition-smooth
              "
            >
              <Icon name="X" size={14} color="currentColor" />
              <span className="text-sm">Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-surface rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === paginatedPayments.length && paginatedPayments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-smooth"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Transaction ID</span>
                      <Icon 
                        name={sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        size={14} 
                        color="currentColor"
                      />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-smooth"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <Icon 
                        name={sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        size={14} 
                        color="currentColor"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                    Cryptocurrency
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                    Recipient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                    Status
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-smooth"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <Icon 
                        name={sortConfig.key === 'timestamp' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        size={14} 
                        color="currentColor"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-background transition-smooth">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handleSelectPayment(payment.id)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono text-text-primary bg-background px-2 py-1 rounded">
                        {payment.id}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {payment.cryptocurrency.amount} {payment.cryptocurrency.symbol}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Icon 
                          name={getCryptoIcon(payment.cryptocurrency.type)} 
                          size={16} 
                          color="currentColor"
                          className="text-text-secondary"
                        />
                        <span className="text-sm text-text-primary">{payment.cryptocurrency.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{payment.recipient}</p>
                        <p className="text-xs text-text-secondary">{payment.recipientEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${getStatusColor(payment.status)}
                      `}>
                        <Icon 
                          name={payment.status === 'completed' ? 'CheckCircle' : 
                                payment.status === 'pending' ? 'Clock' : 'XCircle'} 
                          size={12} 
                          color="currentColor"
                          className="mr-1"
                        />
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(payment.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="
                            p-1.5 rounded-lg
                            hover:bg-secondary-100 transition-smooth
                            text-text-secondary hover:text-text-primary
                          "
                          title="View Details"
                        >
                          <Icon name="Eye" size={16} color="currentColor" />
                        </button>
                        {payment.status === 'completed' && (
                          <button
                            className="
                              p-1.5 rounded-lg
                              hover:bg-secondary-100 transition-smooth
                              text-text-secondary hover:text-text-primary
                            "
                            title="Process Refund"
                          >
                            <Icon name="RotateCcw" size={16} color="currentColor" />
                          </button>
                        )}
                        <button
                          className="
                            p-1.5 rounded-lg
                            hover:bg-secondary-100 transition-smooth
                            text-text-secondary hover:text-text-primary
                          "
                          title="Download Receipt"
                        >
                          <Icon name="Download" size={16} color="currentColor" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden space-y-4">
          {paginatedPayments.map((payment) => (
            <div key={payment.id} className="bg-surface rounded-lg border border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment.id)}
                    onChange={() => handleSelectPayment(payment.id)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <code className="text-sm font-mono text-text-primary bg-background px-2 py-1 rounded">
                      {payment.id}
                    </code>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatDate(payment.timestamp)}
                    </p>
                  </div>
                </div>
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${getStatusColor(payment.status)}
                `}>
                  <Icon 
                    name={payment.status === 'completed' ? 'CheckCircle' : 
                          payment.status === 'pending' ? 'Clock' : 'XCircle'} 
                    size={12} 
                    color="currentColor"
                    className="mr-1"
                  />
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Amount:</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">
                      ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {payment.cryptocurrency.amount} {payment.cryptocurrency.symbol}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Recipient:</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">{payment.recipient}</p>
                    <p className="text-xs text-text-secondary">{payment.recipientEmail}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Cryptocurrency:</span>
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getCryptoIcon(payment.cryptocurrency.type)} 
                      size={16} 
                      color="currentColor"
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-primary">{payment.cryptocurrency.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
                <button
                  onClick={() => handleViewDetails(payment)}
                  className="
                    flex items-center space-x-1 px-3 py-1.5
                    text-text-secondary hover:text-text-primary
                    hover:bg-secondary-100 rounded-lg transition-smooth
                  "
                >
                  <Icon name="Eye" size={14} color="currentColor" />
                  <span className="text-sm">View</span>
                </button>
                {payment.status === 'completed' && (
                  <button className="
                    flex items-center space-x-1 px-3 py-1.5
                    text-text-secondary hover:text-text-primary
                    hover:bg-secondary-100 rounded-lg transition-smooth
                  ">
                    <Icon name="RotateCcw" size={14} color="currentColor" />
                    <span className="text-sm">Refund</span>
                  </button>
                )}
                <button className="
                  flex items-center space-x-1 px-3 py-1.5
                  text-text-secondary hover:text-text-primary
                  hover:bg-secondary-100 rounded-lg transition-smooth
                ">
                  <Icon name="Download" size={14} color="currentColor" />
                  <span className="text-sm">Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPayments.length)} of {filteredAndSortedPayments.length} results
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="
                  flex items-center space-x-1 px-3 py-2
                  border border-border rounded-lg
                  text-text-secondary hover:text-text-primary
                  hover:bg-secondary-100 transition-smooth
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Icon name="ChevronLeft" size={16} color="currentColor" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        w-10 h-10 rounded-lg transition-smooth
                        ${currentPage === page
                          ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="
                  flex items-center space-x-1 px-3 py-2
                  border border-border rounded-lg
                  text-text-secondary hover:text-text-primary
                  hover:bg-secondary-100 transition-smooth
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <span>Next</span>
                <Icon name="ChevronRight" size={16} color="currentColor" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {isModalOpen && selectedPayment && (
        <PaymentDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          paymentData={selectedPayment}
        />
      )}
    </div>
  );
};

export default PaymentsManagement;