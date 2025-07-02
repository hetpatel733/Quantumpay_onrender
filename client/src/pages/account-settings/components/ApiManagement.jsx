import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ApiManagement = () => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'pk_live_1234567890abcdef1234567890abcdef',
      secret: 'sk_live_abcdef1234567890abcdef1234567890',
      created: '2024-01-10T10:00:00Z',
      lastUsed: '2024-01-15T14:30:00Z',
      permissions: ['read', 'write'],
      isActive: true
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'pk_test_1234567890abcdef1234567890abcdef',
      secret: 'sk_test_abcdef1234567890abcdef1234567890',
      created: '2024-01-05T09:00:00Z',
      lastUsed: '2024-01-14T16:45:00Z',
      permissions: ['read'],
      isActive: true
    }
  ]);

  const [usageStats, setUsageStats] = useState({
    totalRequests: 15420,
    successfulRequests: 15180,
    failedRequests: 240,
    rateLimitHits: 12,
    monthlyLimit: 100000,
    currentUsage: 15420
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: ['read']
  });

  const permissions = [
    { id: 'read', label: 'Read', description: 'View payment data and transactions' },
    { id: 'write', label: 'Write', description: 'Create and modify payment requests' },
    { id: 'refund', label: 'Refund', description: 'Process refunds and cancellations' },
    { id: 'webhook', label: 'Webhook', description: 'Manage webhook configurations' }
  ];

  const handleCreateApiKey = () => {
    const newKey = {
      id: apiKeys.length + 1,
      name: newApiKey.name,
      key: `pk_${newApiKey.permissions.includes('write') ? 'live' : 'test'}_${Math.random().toString(36).substr(2, 32)}`,
      secret: `sk_${newApiKey.permissions.includes('write') ? 'live' : 'test'}_${Math.random().toString(36).substr(2, 32)}`,
      created: new Date().toISOString(),
      lastUsed: null,
      permissions: newApiKey.permissions,
      isActive: true
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKey({ name: '', permissions: ['read'] });
    setShowCreateModal(false);
  };

  const handleDeleteApiKey = (keyId) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
  };

  const handleToggleApiKey = (keyId) => {
    setApiKeys(apiKeys.map(key =>
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    ));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePermissionToggle = (permission) => {
    setNewApiKey(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">API Management</h2>
          <p className="text-text-secondary mt-1">
            Manage API keys, view usage statistics, and access integration documentation
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="
            px-4 py-2 bg-primary text-white rounded-lg
            hover:bg-primary-700 transition-smooth
            flex items-center space-x-2
          "
        >
          <Icon name="Plus" size={16} color="currentColor" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* Usage Statistics */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">API Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{usageStats.totalRequests.toLocaleString()}</div>
            <div className="text-sm text-text-secondary">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{usageStats.successfulRequests.toLocaleString()}</div>
            <div className="text-sm text-text-secondary">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error">{usageStats.failedRequests.toLocaleString()}</div>
            <div className="text-sm text-text-secondary">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{usageStats.rateLimitHits.toLocaleString()}</div>
            <div className="text-sm text-text-secondary">Rate Limit Hits</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">Monthly Usage</span>
            <span className="text-sm text-text-secondary">
              {usageStats.currentUsage.toLocaleString()} / {usageStats.monthlyLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-layout"
              style={{ width: `${(usageStats.currentUsage / usageStats.monthlyLimit) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">API Keys</h3>
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-text-primary">{apiKey.name}</h4>
                  <div className="flex items-center space-x-2">
                    {apiKey.permissions.map(permission => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-secondary-100 text-text-secondary text-xs rounded-full"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${apiKey.isActive 
                      ? 'bg-success-100 text-success-700' :'bg-error-100 text-error-700'
                    }
                  `}>
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleApiKey(apiKey.id)}
                    className="
                      p-2 rounded-lg
                      hover:bg-secondary-100 transition-smooth
                      text-text-secondary hover:text-text-primary
                    "
                  >
                    <Icon name={apiKey.isActive ? 'Pause' : 'Play'} size={16} color="currentColor" />
                  </button>
                  <button
                    onClick={() => handleDeleteApiKey(apiKey.id)}
                    className="
                      p-2 rounded-lg
                      hover:bg-error-50 transition-smooth
                      text-text-secondary hover:text-error
                    "
                  >
                    <Icon name="Trash2" size={16} color="currentColor" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Public Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 font-mono text-sm text-text-primary bg-background px-3 py-2 rounded border">
                      {apiKey.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="
                        p-2 border border-border rounded
                        hover:bg-secondary-100 transition-smooth
                        text-text-secondary hover:text-text-primary
                      "
                    >
                      <Icon name="Copy" size={16} color="currentColor" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Secret Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 font-mono text-sm text-text-primary bg-background px-3 py-2 rounded border">
                      {apiKey.secret.substring(0, 20)}...
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.secret)}
                      className="
                        p-2 border border-border rounded
                        hover:bg-secondary-100 transition-smooth
                        text-text-secondary hover:text-text-primary
                      "
                    >
                      <Icon name="Copy" size={16} color="currentColor" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Created: {formatDate(apiKey.created)}</span>
                  <span>Last Used: {formatDate(apiKey.lastUsed)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Links */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">API Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="
              flex items-center space-x-3 p-4 border border-border rounded-lg
              hover:bg-secondary-50 transition-smooth
            "
          >
            <Icon name="Book" size={20} color="var(--color-primary)" />
            <div>
              <h4 className="font-medium text-text-primary">API Reference</h4>
              <p className="text-sm text-text-secondary">Complete API documentation and examples</p>
            </div>
          </a>

          <a
            href="#"
            className="
              flex items-center space-x-3 p-4 border border-border rounded-lg
              hover:bg-secondary-50 transition-smooth
            "
          >
            <Icon name="Code" size={20} color="var(--color-primary)" />
            <div>
              <h4 className="font-medium text-text-primary">Code Examples</h4>
              <p className="text-sm text-text-secondary">Integration examples in multiple languages</p>
            </div>
          </a>

          <a
            href="#"
            className="
              flex items-center space-x-3 p-4 border border-border rounded-lg
              hover:bg-secondary-50 transition-smooth
            "
          >
            <Icon name="Zap" size={20} color="var(--color-primary)" />
            <div>
              <h4 className="font-medium text-text-primary">Webhooks Guide</h4>
              <p className="text-sm text-text-secondary">Learn how to handle webhook events</p>
            </div>
          </a>

          <a
            href="#"
            className="
              flex items-center space-x-3 p-4 border border-border rounded-lg
              hover:bg-secondary-50 transition-smooth
            "
          >
            <Icon name="HelpCircle" size={20} color="var(--color-primary)" />
            <div>
              <h4 className="font-medium text-text-primary">Support</h4>
              <p className="text-sm text-text-secondary">Get help with API integration</p>
            </div>
          </a>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-surface rounded-lg shadow-dropdown w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Create New API Key</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <Icon name="X" size={20} color="currentColor" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  API Key Name
                </label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                  className="
                    w-full px-3 py-2 border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    text-text-primary bg-background
                  "
                  placeholder="e.g., Production API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <button
                        onClick={() => handlePermissionToggle(permission.id)}
                        className={`
                          mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center
                          ${newApiKey.permissions.includes(permission.id)
                            ? 'bg-primary border-primary' :'border-border'
                          }
                        `}
                      >
                        {newApiKey.permissions.includes(permission.id) && (
                          <Icon name="Check" size={12} color="white" />
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{permission.label}</div>
                        <div className="text-xs text-text-secondary">{permission.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="
                  px-4 py-2 border border-border rounded-lg
                  text-text-secondary hover:text-text-primary
                  hover:bg-secondary-100 transition-smooth
                "
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                disabled={!newApiKey.name.trim()}
                className="
                  px-4 py-2 bg-primary text-white rounded-lg
                  hover:bg-primary-700 transition-smooth
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiManagement;