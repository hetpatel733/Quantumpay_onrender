import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from 'components/AppIcon';

import RecentActivity from './components/RecentActivity';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [metrics, setMetrics] = useState({
    totalPayments: 15847.50,
    pendingTransactions: 23,
    completedVolume: 142350.75,
    failedPayments: 8
  });

  // Mock chart data for payment trends
  const chartData = {
    '7': [
      { name: 'Mon', BTC: 2400, ETH: 1800, USDT: 3200 },
      { name: 'Tue', BTC: 1398, ETH: 2200, USDT: 2800 },
      { name: 'Wed', BTC: 9800, ETH: 1600, USDT: 4100 },
      { name: 'Thu', BTC: 3908, ETH: 2400, USDT: 3600 },
      { name: 'Fri', BTC: 4800, ETH: 1900, USDT: 3900 },
      { name: 'Sat', BTC: 3800, ETH: 2100, USDT: 3400 },
      { name: 'Sun', BTC: 4300, ETH: 1700, USDT: 3100 }
    ],
    '30': [
      { name: 'Week 1', BTC: 24000, ETH: 18000, USDT: 32000 },
      { name: 'Week 2', BTC: 13980, ETH: 22000, USDT: 28000 },
      { name: 'Week 3', BTC: 98000, ETH: 16000, USDT: 41000 },
      { name: 'Week 4', BTC: 39080, ETH: 24000, USDT: 36000 }
    ],
    '90': [
      { name: 'Month 1', BTC: 240000, ETH: 180000, USDT: 320000 },
      { name: 'Month 2', BTC: 139800, ETH: 220000, USDT: 280000 },
      { name: 'Month 3', BTC: 980000, ETH: 160000, USDT: 410000 }
    ]
  };

  // Mock cryptocurrency distribution data
  const cryptoDistribution = [
    { name: 'Bitcoin', value: 45, color: '#F7931A' },
    { name: 'Ethereum', value: 30, color: '#627EEA' },
    { name: 'USDT', value: 20, color: '#26A17B' },
    { name: 'Others', value: 5, color: '#64748B' }
  ];

  const metricCards = [
    {
      title: 'Total Payments',
      value: `$${metrics.totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      route: '/dashboard/payments-management'
    },
    {
      title: 'Pending Transactions',
      value: metrics.pendingTransactions.toString(),
      change: '+3',
      changeType: 'neutral',
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning-50',
      route: '/dashboard/payments-management?status=pending'
    },
    {
      title: 'Completed Volume',
      value: `$${metrics.completedVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: '+8.2%',
      changeType: 'positive',
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success-50',
      route: '/dashboard/payments-management?status=completed'
    },
    {
      title: 'Failed Payments',
      value: metrics.failedPayments.toString(),
      change: '-2',
      changeType: 'positive',
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error-50',
      route: '/dashboard/payments-management?status=failed'
    }
  ];

  const periodOptions = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        pendingTransactions: Math.max(0, prev.pendingTransactions + Math.floor(Math.random() * 3) - 1)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const handleMetricCardClick = (route) => {
    window.location.href = route;
  };

  const handleGeneratePaymentLink = () => {
    // Mock payment link generation
    const mockLink = `https://cryptopay.example.com/pay/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(mockLink);
    alert('Payment link generated and copied to clipboard!');
  };

  const handleExportReport = () => {
    // Mock report export
    alert('Report export initiated. You will receive an email when ready.');
  };

  return (
    <div className="p-6 space-y-6 overflow-x-hidden max-w-full">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard Overview</h1>
          <p className="text-text-secondary mt-1">Monitor your cryptocurrency payment performance</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleGeneratePaymentLink}
            className="
              flex items-center justify-center space-x-2 px-4 py-2
              bg-primary text-white rounded-lg
              hover:bg-primary-700 transition-smooth
              font-medium
            "
          >
            <Icon name="Link" size={20} color="currentColor" />
            <span>Generate Payment Link</span>
          </button>
          <button
            onClick={handleExportReport}
            className="
              flex items-center justify-center space-x-2 px-4 py-2
              border border-border rounded-lg
              text-text-primary hover:bg-secondary-100
              transition-smooth font-medium
            "
          >
            <Icon name="Download" size={20} color="currentColor" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleMetricCardClick(card.route)}
            className="
              bg-surface border border-border rounded-lg p-6
              hover:shadow-card transition-smooth cursor-pointer
              group
            "
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon name={card.icon} size={24} color={`var(--color-${card.color.split('-')[1]})`} />
              </div>
              <div className={`text-sm font-medium ${getChangeColor(card.changeType)}`}>
                {card.change}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-1 group-hover:text-primary transition-smooth">
                {card.value}
              </h3>
              <p className="text-text-secondary text-sm">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Payment Trends Chart */}
        <div className="xl:col-span-2 bg-surface border border-border rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Payment Trends</h2>
              <p className="text-text-secondary text-sm">Cryptocurrency payment volume over time</p>
            </div>
            <div className="flex space-x-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth
                    ${selectedPeriod === option.value
                      ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData[selectedPeriod]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-text-secondary)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Bar dataKey="BTC" fill="#F7931A" name="Bitcoin" />
                <Bar dataKey="ETH" fill="#627EEA" name="Ethereum" />
                <Bar dataKey="USDT" fill="#26A17B" name="USDT" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cryptocurrency Distribution */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Crypto Distribution</h2>
            <p className="text-text-secondary text-sm">Payment volume by cryptocurrency</p>
          </div>
          
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cryptoDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {cryptoDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {cryptoDistribution.map((crypto, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: crypto.color }}
                  />
                  <span className="text-text-primary text-sm font-medium">{crypto.name}</span>
                </div>
                <span className="text-text-secondary text-sm">{crypto.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;