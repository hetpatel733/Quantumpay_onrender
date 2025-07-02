import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ProfileInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: 'Acme Corporation',
    contactName: 'John Anderson',
    email: 'john.anderson@acme.com',
    phone: '+1 (555) 123-4567',
    website: 'https://acme.com',
    businessType: 'E-commerce',
    country: 'United States',
    timezone: 'America/New_York',
    businessDescription: `Acme Corporation is a leading e-commerce platform specializing in innovative consumer electronics and smart home solutions. Founded in 2018, we've grown to serve over 50,000 customers worldwide with a focus on quality products and exceptional customer service.

Our mission is to make cutting-edge technology accessible to everyone while maintaining the highest standards of security and reliability in our payment processing systems.`,
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'
  });

  const businessTypes = [
    'E-commerce',
    'SaaS',
    'Digital Services',
    'Consulting',
    'Retail',
    'Manufacturing',
    'Healthcare',
    'Education',
    'Other'
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Profile Information</h2>
          <p className="text-text-secondary mt-1">
            Manage your business details and contact information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="
                  px-4 py-2 border border-border rounded-lg
                  text-text-secondary hover:text-text-primary
                  hover:bg-secondary-100 transition-smooth
                "
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="
                  px-4 py-2 bg-primary text-white rounded-lg
                  hover:bg-primary-700 transition-smooth
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center space-x-2
                "
              >
                {isSaving && <Icon name="Loader2" size={16} color="currentColor" className="animate-spin" />}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="
                px-4 py-2 bg-primary text-white rounded-lg
                hover:bg-primary-700 transition-smooth
                flex items-center space-x-2
              "
            >
              <Icon name="Edit" size={16} color="currentColor" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Image */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary-100">
              <Image
                src={profileData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <label className="
                absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full
                flex items-center justify-center cursor-pointer
                hover:bg-primary-700 transition-smooth
              ">
                <Icon name="Camera" size={16} color="white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h4 className="font-medium text-text-primary">{profileData.contactName}</h4>
            <p className="text-text-secondary text-sm">{profileData.businessName}</p>
            {isEditing && (
              <p className="text-xs text-text-secondary mt-2">
                Click the camera icon to upload a new photo. Recommended size: 400x400px
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Business Name *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            ) : (
              <p className="text-text-primary py-2">{profileData.businessName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Contact Name *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            ) : (
              <p className="text-text-primary py-2">{profileData.contactName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Address *
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            ) : (
              <p className="text-text-primary py-2">{profileData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            ) : (
              <p className="text-text-primary py-2">{profileData.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            ) : (
              <p className="text-text-primary py-2">
                <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
                   className="text-primary hover:underline">
                  {profileData.website}
                </a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Business Type
            </label>
            {isEditing ? (
              <select
                value={profileData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              >
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <p className="text-text-primary py-2">{profileData.businessType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Country
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              />
            ) : (
              <p className="text-text-primary py-2">{profileData.country}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Timezone
            </label>
            {isEditing ? (
              <select
                value={profileData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="
                  w-full px-3 py-2 border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  text-text-primary bg-background
                "
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            ) : (
              <p className="text-text-primary py-2">{profileData.timezone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Business Description */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Business Description</h3>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tell us about your business
          </label>
          {isEditing ? (
            <textarea
              value={profileData.businessDescription}
              onChange={(e) => handleInputChange('businessDescription', e.target.value)}
              rows={6}
              className="
                w-full px-3 py-2 border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                text-text-primary bg-background resize-none
              "
              placeholder="Describe your business, mission, and what makes you unique..."
            />
          ) : (
            <div className="text-text-primary py-2 whitespace-pre-line">
              {profileData.businessDescription}
            </div>
          )}
        </div>
      </div>

      {/* Auto-save Notice */}
      {!isEditing && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={16} color="var(--color-accent)" />
            <p className="text-sm text-accent-700">
              Your profile information is automatically saved when you make changes. 
              Critical updates may require email verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInformation;