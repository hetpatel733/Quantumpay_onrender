import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    paymentReceived: true,
    paymentFailed: true,
    dailySummary: true,
    weeklySummary: false,
    securityAlerts: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const [webhookSettings, setWebhookSettings] = useState({
    enabled: true,
    url: 'https://api.acme.com/webhooks/cryptopay',
    secret: 'whsec_1234567890abcdef',
    events: {
      paymentCompleted: true,
      paymentFailed: true,
      paymentPending: false,
      refundProcessed: true,
      disputeCreated: false
    }
  });

  const [pushNotifications, setPushNotifications] = useState({
    enabled: true,
    paymentAlerts: true,
    securityAlerts: true,
    systemAlerts: false
  });

  const handleEmailToggle = (setting) => {
    setEmailNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleWebhookToggle = (setting) => {
    if (setting === 'enabled') {
      setWebhookSettings(prev => ({
        ...prev,
        enabled: !prev.enabled
      }));
    } else {
      setWebhookSettings(prev => ({
        ...prev,
        events: {
          ...prev.events,
          [setting]: !prev.events[setting]
        }
      }));
    }
  };

  const handlePushToggle = (setting) => {
    setPushNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleWebhookUrlChange = (field, value) => {
    setWebhookSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testWebhook = () => {
    console.log('Testing webhook endpoint...');
  };

  const copyWebhookSecret = () => {
    navigator.clipboard.writeText(webhookSettings.secret);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Notification Settings</h2>
        <p className="text-text-secondary mt-1">
          Configure email alerts, webhook endpoints, and push notification preferences
        </p>
      </div>

      {/* Email Notifications */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Email Notifications</h3>
        <p className="text-text-secondary text-sm mb-4">
          Choose which email notifications you'd like to receive
        </p>
        
        <div className="space-y-4">
          {/* Payment Notifications */}
          <div>
            <h4 className="font-medium text-text-primary mb-3">Payment Events</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Payment Received
                  </label>
                  <p className="text-xs text-text-secondary">
                    Get notified when a payment is successfully received
                  </p>
                </div>
                <button
                  onClick={() => handleEmailToggle('paymentReceived')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                    ${emailNotifications.paymentReceived ? 'bg-success' : 'bg-secondary-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                      ${emailNotifications.paymentReceived ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Payment Failed
                  </label>
                  <p className="text-xs text-text-secondary">
                    Get notified when a payment fails or is rejected
                  </p>
                </div>
                <button
                  onClick={() => handleEmailToggle('paymentFailed')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                    ${emailNotifications.paymentFailed ? 'bg-success' : 'bg-secondary-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                      ${emailNotifications.paymentFailed ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Summary Reports */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-text-primary mb-3">Summary Reports</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Daily Summary
                  </label>
                  <p className="text-xs text-text-secondary">
                    Daily report of all payment activities
                  </p>
                </div>
                <button
                  onClick={() => handleEmailToggle('dailySummary')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                    ${emailNotifications.dailySummary ? 'bg-success' : 'bg-secondary-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                      ${emailNotifications.dailySummary ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Weekly Summary
                  </label>
                  <p className="text-xs text-text-secondary">
                    Weekly report with analytics and insights
                  </p>
                </div>
                <button
                  onClick={() => handleEmailToggle('weeklySummary')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                    ${emailNotifications.weeklySummary ? 'bg-success' : 'bg-secondary-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                      ${emailNotifications.weeklySummary ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* System Notifications */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-text-primary mb-3">System & Security</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Security Alerts
                  </label>
                  <p className="text-xs text-text-secondary">
                    Important security notifications and login alerts
                  </p>
                </div>
                <button
                  onClick={() => handleEmailToggle('securityAlerts')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                    ${emailNotifications.securityAlerts ? 'bg-success' : 'bg-secondary-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                      ${emailNotifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    System Updates
                  </label>
                  <p className="text-xs text-text-secondary">
                    Platform updates and maintenance notifications
                  </p>
                </div>
                <button
                  onClick={() => handleEmailToggle('systemUpdates')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                    ${emailNotifications.systemUpdates ? 'bg-success' : 'bg-secondary-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                      ${emailNotifications.systemUpdates ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-text-primary">
                    Marketing Emails
                  </label>
                  <p className="text-xs text-text-secondary">
                    Product updates, tips, and promotional content
                  </p>
                </div>
                <button
                  onClick={() => handleEmailToggle('marketingEmails')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                    ${emailNotifications.marketingEmails ? 'bg-success' : 'bg-secondary-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                      ${emailNotifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Settings */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Webhook Configuration</h3>
            <p className="text-text-secondary text-sm mt-1">
              Configure webhook endpoints for real-time event notifications
            </p>
          </div>
          <button
            onClick={() => handleWebhookToggle('enabled')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
              ${webhookSettings.enabled ? 'bg-success' : 'bg-secondary-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                ${webhookSettings.enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {webhookSettings.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Webhook URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={webhookSettings.url}
                  onChange={(e) => handleWebhookUrlChange('url', e.target.value)}
                  className="
                    flex-1 px-3 py-2 border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    text-text-primary bg-background font-mono text-sm
                  "
                  placeholder="https://your-domain.com/webhook"
                />
                <button
                  onClick={testWebhook}
                  className="
                    px-4 py-2 border border-border rounded-lg
                    text-text-secondary hover:text-text-primary
                    hover:bg-secondary-100 transition-smooth
                    flex items-center space-x-2
                  "
                >
                  <Icon name="Zap" size={16} color="currentColor" />
                  <span>Test</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Webhook Secret
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={webhookSettings.secret}
                  onChange={(e) => handleWebhookUrlChange('secret', e.target.value)}
                  className="
                    flex-1 px-3 py-2 border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    text-text-primary bg-background font-mono text-sm
                  "
                  placeholder="Webhook signing secret"
                />
                <button
                  onClick={copyWebhookSecret}
                  className="
                    p-2 border border-border rounded-lg
                    hover:bg-secondary-100 transition-smooth
                    text-text-secondary hover:text-text-primary
                  "
                >
                  <Icon name="Copy" size={16} color="currentColor" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-text-primary mb-3">Webhook Events</h4>
              <div className="space-y-3">
                {Object.entries(webhookSettings.events).map(([event, enabled]) => (
                  <div key={event} className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-text-primary">
                        {event.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                    </div>
                    <button
                      onClick={() => handleWebhookToggle(event)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                        ${enabled ? 'bg-success' : 'bg-secondary-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                          ${enabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Push Notifications */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Push Notifications</h3>
            <p className="text-text-secondary text-sm mt-1">
              Configure mobile and browser push notifications
            </p>
          </div>
          <button
            onClick={() => handlePushToggle('enabled')}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
              ${pushNotifications.enabled ? 'bg-success' : 'bg-secondary-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                ${pushNotifications.enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {pushNotifications.enabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Payment Alerts
                </label>
                <p className="text-xs text-text-secondary">
                  Instant notifications for payment events
                </p>
              </div>
              <button
                onClick={() => handlePushToggle('paymentAlerts')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                  ${pushNotifications.paymentAlerts ? 'bg-success' : 'bg-secondary-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                    ${pushNotifications.paymentAlerts ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  Security Alerts
                </label>
                <p className="text-xs text-text-secondary">
                  Critical security notifications
                </p>
              </div>
              <button
                onClick={() => handlePushToggle('securityAlerts')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                  ${pushNotifications.securityAlerts ? 'bg-success' : 'bg-secondary-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                    ${pushNotifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-text-primary">
                  System Alerts
                </label>
                <p className="text-xs text-text-secondary">
                  System maintenance and updates
                </p>
              </div>
              <button
                onClick={() => handlePushToggle('systemAlerts')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                  ${pushNotifications.systemAlerts ? 'bg-success' : 'bg-secondary-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                    ${pushNotifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        )}
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
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;