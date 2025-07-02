import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const SecuritySettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const activeSessions = [
    {
      id: 1,
      device: 'MacBook Pro',
      browser: 'Chrome 120.0',
      location: 'New York, NY',
      ipAddress: '192.168.1.100',
      lastActive: '2024-01-15T14:30:00Z',
      isCurrent: true
    },
    {
      id: 2,
      device: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      location: 'New York, NY',
      ipAddress: '192.168.1.101',
      lastActive: '2024-01-15T12:15:00Z',
      isCurrent: false
    },
    {
      id: 3,
      device: 'Windows Desktop',
      browser: 'Edge 120.0',
      location: 'New York, NY',
      ipAddress: '192.168.1.102',
      lastActive: '2024-01-14T18:45:00Z',
      isCurrent: false
    }
  ];

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Handle password change logic
    console.log('Password change submitted');
  };

  const handleTerminateSession = (sessionId) => {
    console.log('Terminating session:', sessionId);
  };

  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Security Settings</h2>
        <p className="text-text-secondary mt-1">
          Manage your password, two-factor authentication, and active sessions
        </p>
      </div>

      {/* Password Change */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="
                  w-full px-3 py-2 pr-10 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <Icon name={showCurrentPassword ? 'EyeOff' : 'Eye'} size={16} color="currentColor" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="
                    w-full px-3 py-2 pr-10 border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    text-text-primary bg-background
                  "
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <Icon name={showNewPassword ? 'EyeOff' : 'Eye'} size={16} color="currentColor" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="
                    w-full px-3 py-2 pr-10 border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    text-text-primary bg-background
                  "
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} color="currentColor" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={16} color="var(--color-warning)" className="mt-0.5" />
              <div className="text-sm text-warning-700">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="
                px-6 py-2 bg-primary text-white rounded-lg
                hover:bg-primary-700 transition-smooth
                flex items-center space-x-2
              "
            >
              <Icon name="Key" size={16} color="currentColor" />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Two-Factor Authentication</h3>
            <p className="text-text-secondary text-sm mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${twoFactorEnabled ? 'text-success' : 'text-text-secondary'}`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-smooth
                ${twoFactorEnabled ? 'bg-success' : 'bg-secondary-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-smooth
                  ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {twoFactorEnabled && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Shield" size={16} color="var(--color-success)" />
              <p className="text-sm text-success-700">
                Two-factor authentication is active. You'll need your authenticator app to sign in.
              </p>
            </div>
            <div className="mt-3 flex space-x-3">
              <button className="text-sm text-success-700 hover:text-success-800 font-medium">
                View Recovery Codes
              </button>
              <button className="text-sm text-success-700 hover:text-success-800 font-medium">
                Reconfigure
              </button>
            </div>
          </div>
        )}

        {!twoFactorEnabled && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
              <p className="text-sm text-warning-700">
                Your account is not protected by two-factor authentication. Enable it for better security.
              </p>
            </div>
            <button className="mt-3 text-sm text-warning-700 hover:text-warning-800 font-medium">
              Set Up Two-Factor Authentication
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Active Sessions</h3>
            <p className="text-text-secondary text-sm mt-1">
              Manage devices that are currently signed in to your account
            </p>
          </div>
          <button className="
            px-4 py-2 border border-border rounded-lg
            text-text-secondary hover:text-text-primary
            hover:bg-secondary-100 transition-smooth
            flex items-center space-x-2
          ">
            <Icon name="RotateCcw" size={16} color="currentColor" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Icon 
                    name={session.device.includes('iPhone') ? 'Smartphone' : 
                          session.device.includes('MacBook') ? 'Laptop' : 'Monitor'} 
                    size={20} 
                    color="currentColor"
                    className="text-text-secondary"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-text-primary">{session.device}</h4>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-text-secondary">
                    IP: {session.ipAddress} • {formatLastActive(session.lastActive)}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleTerminateSession(session.id)}
                  className="
                    px-3 py-1.5 text-error border border-error rounded-lg
                    hover:bg-error-50 transition-smooth
                    text-sm font-medium
                  "
                >
                  Terminate
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <button className="
            w-full px-4 py-2 border border-error text-error rounded-lg
            hover:bg-error-50 transition-smooth
            flex items-center justify-center space-x-2
          ">
            <Icon name="LogOut" size={16} color="currentColor" />
            <span>Sign Out All Other Sessions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;