import React, { useState } from 'react';
import Icon from 'components/AppIcon';

import ExportConfiguration from './components/ExportConfiguration';
import ExportPreview from './components/ExportPreview';
import ExportHistory from './components/ExportHistory';

const TransactionExport = () => {
  const [exportConfig, setExportConfig] = useState({
    dateRange: 'last30days',
    customStartDate: '',
    customEndDate: '',
    status: 'all',
    cryptocurrencies: [],
    amountRange: { min: '', max: '' },
    customers: [],
    format: 'csv',
    columns: ['date', 'amount', 'status', 'customer', 'cryptocurrency'],
    includeHeaders: true,
    emailDelivery: false,
    emailAddress: ''
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('configure');

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsExporting(false);
          // Add to export history
          const newExport = {
            id: `EXP_${Date.now()}`,
            name: `Transaction Export - ${new Date().toLocaleDateString()}`,
            format: exportConfig.format.toUpperCase(),
            status: 'completed',
            createdAt: new Date().toISOString(),
            recordCount: 1247,
            fileSize: '2.3 MB',
            downloadUrl: '#'
          };
          // In real app, this would update the export history
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const tabs = [
    { id: 'configure', label: 'Configure Export', icon: 'Settings' },
    { id: 'preview', label: 'Preview Data', icon: 'Eye' },
    { id: 'history', label: 'Export History', icon: 'Clock' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      <div className="px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Icon name="Download" size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">Transaction Export</h1>
                <p className="text-text-secondary">Generate comprehensive payment reports for analysis</p>
              </div>
            </div>
            
            {activeTab === 'configure' && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="
                  flex items-center space-x-2 px-6 py-3
                  bg-primary text-white rounded-lg
                  hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-smooth font-medium
                "
              >
                {isExporting ? (
                  <>
                    <Icon name="Loader2" size={20} color="currentColor" className="animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Download" size={20} color="currentColor" />
                    <span>Generate Export</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="mb-6 bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">Generating Export</span>
              <span className="text-sm text-text-secondary">{Math.round(exportProgress)}%</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-layout"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Estimated time remaining: {Math.max(0, Math.round((100 - exportProgress) / 10))} seconds
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-smooth
                    ${activeTab === tab.id
                      ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary-300'
                    }
                  `}
                >
                  <Icon name={tab.icon} size={16} color="currentColor" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'configure' && (
            <ExportConfiguration 
              config={exportConfig}
              onConfigChange={setExportConfig}
            />
          )}
          
          {activeTab === 'preview' && (
            <ExportPreview config={exportConfig} />
          )}
          
          {activeTab === 'history' && (
            <ExportHistory />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionExport;