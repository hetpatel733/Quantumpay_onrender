import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from 'components/AppIcon';
import { dashboardAPI } from 'utils/api';
import { debounce } from 'components/lib/utils';
import PaymentLinkModal from '../payments-management/components/PaymentLinkModal';

import RecentActivity from './components/RecentActivity';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaymentLinkModalOpen, setIsPaymentLinkModalOpen] = useState(false);

  // Create metrics from real data - Remove Total Payments card
  const getMetrics = () => {
    if (!dashboardData) return [];

    // Defensive: always provide a fallback structure
    const todayMetrics = {
      ...{
        currentMonthSummary: { pending: 0, failed: 0 },
        totalSales: 0
      },
      ...dashboardData.todayMetrics
    };

    return [
      {
        title: 'Pending Transactions',
        value: todayMetrics.currentMonthSummary?.pending?.toString() || '0',
        change: '+0',
        changeType: 'neutral',
        icon: 'Clock',
        color: 'text-warning',
        bgColor: 'bg-warning-50',
        route: '/dashboard/payments-management?status=pending'
      },
      {
        title: 'Completed Volume',
        value: `$${(todayMetrics.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        change: '+0.0%',
        changeType: 'neutral',
        icon: 'CheckCircle',
        color: 'text-success',
        bgColor: 'bg-success-50',
        route: '/dashboard/payments-management?status=completed'
      },
      {
        title: 'Failed Payments',
        value: todayMetrics.currentMonthSummary?.failed?.toString() || '0',
        change: '+0',
        changeType: 'neutral',
        icon: 'XCircle',
        color: 'text-error',
        bgColor: 'bg-error-50',
        route: '/dashboard/payments-management?status=failed'
      }
    ];
  };

  // Enhanced chart data formatter
  const getChartData = () => {
    if (!dashboardData || !dashboardData.dailyBreakdown || dashboardData.dailyBreakdown.length === 0) {
      console.log('⚠️ No daily breakdown data for chart');
      // Return placeholder data with updated crypto types
      return Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6-i));
        return {
          name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          BTC: 0,
          ETH: 0,
          USDT: 0,
          USDC: 0,
          MATIC: 0,
          SOL: 0
        };
      });
    }

    console.log('📊 Using daily breakdown data for chart:', dashboardData.dailyBreakdown.length, 'days');
    
    // Use the daily breakdown data from the API with updated crypto types
    return dashboardData.dailyBreakdown.map(day => ({
      name: day.name,
      BTC: parseFloat(day.BTC || 0),
      ETH: parseFloat(day.ETH || 0),
      USDT: parseFloat(day.USDT || 0),
      USDC: parseFloat(day.USDC || 0),
      MATIC: parseFloat(day.MATIC || 0),
      SOL: parseFloat(day.SOL || 0)
    }));
  };

  // Create crypto distribution from real data
  const getCryptoDistribution = () => {
    if (!dashboardData || !dashboardData.cryptoDistribution) {
      // Show placeholder for empty state with new crypto types
      return [
        { name: 'USDT', value: 20, color: '#26A17B' },
        { name: 'USDC', value: 20, color: '#1FC7D4' },
        { name: 'BTC', value: 20, color: '#F7931A' },
        { name: 'ETH', value: 20, color: '#627EEA' },
        { name: 'MATIC', value: 10, color: '#8247E5' },
        { name: 'SOL', value: 10, color: '#9945FF' }
      ];
    }

    // Use real distribution data
    return dashboardData.cryptoDistribution.filter(item => item.value > 0);
  };

  // Debounced data fetching to prevent rapid API calls
  const debouncedFetchData = debounce(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching dashboard data ${forceRefresh ? '(force refresh)' : ''}`);
      
      // Fetch all dashboard data in parallel with caching
      const [overviewResponse, cryptoDistResponse] = await Promise.all([
        dashboardAPI.getOverview(selectedPeriod, forceRefresh), // Pass selectedPeriod
        dashboardAPI.getCryptoDistribution(selectedPeriod + 'days')
      ]);
      
      if (overviewResponse.success) {
        console.log('📊 Dashboard data received:', {
          pendingCount: overviewResponse.todayMetrics?.currentMonthSummary?.pending || 0,
          completedVolume: overviewResponse.todayMetrics?.totalSales || 0,
          failedCount: overviewResponse.todayMetrics?.currentMonthSummary?.failed || 0,
          dailyData: overviewResponse.dailyBreakdown?.length || 0
        });
        
        const combinedData = {
          ...overviewResponse,
          cryptoDistribution: cryptoDistResponse.success ? cryptoDistResponse.distribution : []
        };
        setDashboardData(combinedData);
      } else {
        throw new Error(overviewResponse.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. ' + err.message);
      
      // Set default empty data for graceful degradation with updated structure
      setDashboardData({
        todayMetrics: {
          totalSales: 0,
          transactionCount: 0,
          volume: { USDT: 0, USDC: 0, BTC: 0, ETH: 0, MATIC: 0, SOL: 0 },
          currentMonthSummary: { totalPayments: 0, completed: 0, failed: 0, pending: 0 }
        },
        monthlyMetrics: {
          totalSales: 0,
          transactionCount: 0,
          volume: { USDT: 0, USDC: 0, BTC: 0, ETH: 0, MATIC: 0, SOL: 0 }
        },
        orderStats: { total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 },
        cryptoDistribution: []
      });
    } finally {
      setLoading(false);
    }
  }, 300);

  // Fetch dashboard data with force refresh capability
  useEffect(() => {
    debouncedFetchData(false); // Initial load, don't force refresh
  }, [selectedPeriod]); // Only refetch when period changes

  // More aggressive refresh strategy
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Force refresh when tab becomes visible
        debouncedFetchData(true);
      }
    };

    // Auto-refresh every 1 minute when active
    const interval = setInterval(() => {
      if (!document.hidden) {
        debouncedFetchData(true); // Force refresh on interval
      }
    }, 60 * 1000); // 1 minute refresh

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedPeriod]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6 overflow-x-hidden max-w-full">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-secondary">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const metricCards = getMetrics();
  const chartData = getChartData();
  const cryptoDistribution = getCryptoDistribution();

  const periodOptions = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' }
  ];

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

  // Modified: open modal instead of direct link generation
  const handleGeneratePaymentLink = () => {
    setIsPaymentLinkModalOpen(true);
  };

  // Add this function to fix the ReferenceError
  const handleRefreshData = () => {
    debouncedFetchData(true); // Force refresh dashboard data
  };

  return (
    <div className="p-6 space-y-6 overflow-x-hidden max-w-full">
      {/* Error Banner */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="var(--color-error)" />
            <p className="text-error text-sm">{error}</p>
            <button 
              onClick={handleRefreshData} 
              className="ml-auto text-error underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Payment Link Modal */}
      {isPaymentLinkModalOpen && (
        <PaymentLinkModal
          isOpen={isPaymentLinkModalOpen}
          onClose={() => setIsPaymentLinkModalOpen(false)}
          onSuccess={(link) => {
            navigator.clipboard.writeText(link);
            alert(`Payment link generated and copied to clipboard!\n\n${link}`);
          }}
        />
      )}
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard Overview</h1>
          <p className="text-text-secondary mt-1">Monitor your cryptocurrency payment performance</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleRefreshData}
            className="
              flex items-center justify-center space-x-2 px-4 py-2
              border border-border rounded-lg
              text-text-primary hover:bg-secondary-100
              transition-smooth font-medium
            "
          >
            <Icon name="RefreshCcw" size={20} color="currentColor" />
            <span>Refresh Data</span>
          </button>
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
            onClick={() => alert('Report export initiated. You will receive an email when ready.')}
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

      {/* Metrics Cards - Now showing 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            {chartData.length > 0 && chartData.some(day => 
              parseFloat(day.BTC) > 0 || 
              parseFloat(day.ETH) > 0 || 
              parseFloat(day.USDT) > 0 || 
              parseFloat(day.USDC) > 0
            ) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    formatter={(value) => ['$' + parseFloat(value).toFixed(2), 'Volume']}
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
                  <Bar dataKey="USDC" fill="#1FC7D4" name="USDC" />
                  <Bar dataKey="MATIC" fill="#8247E5" name="MATIC" />
                  <Bar dataKey="SOL" fill="#9945FF" name="SOL" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Icon name="BarChart" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
                  <p className="text-text-secondary">No payment data available yet</p>
                  <p className="text-text-secondary text-sm">Start accepting payments to see trends</p>
                </div>
              </div>
            )}
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
      <RecentActivity onPaymentStatusChange={handleRefreshData} />
    </div>
  );
};

export default Dashboard;