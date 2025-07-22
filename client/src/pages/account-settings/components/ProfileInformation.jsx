import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import { usersAPI } from 'utils/api';
import { useAuth } from 'contexts/AuthContext';

const ProfileInformation = ({ userData, refreshUserData }) => {
  console.log('🎯 userData received In ProfileInformation:', userData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    businessType: 'E-commerce',
    country: 'United States',
    timezone: 'America/New_York',
    businessDescription: '',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'
  });

  const { userData: authData } = useAuth();

  // Update profile data when userData changes
  useEffect(() => {
    
    if (userData && typeof userData === 'object') {

      const updatedProfileData = {
        businessName: userData.businessName || userData.name || '',
        contactName: userData.name || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
        website: userData.website || '',
        businessType: userData.businessType || 'E-commerce',
        country: userData.country || 'United States',
        timezone: userData.timeZone || 'America/New_York',
        businessDescription: userData.description || '',
        profileImage: userData.profileImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'
      };
      
      console.log('📝 Setting profileData to:', updatedProfileData);
      setProfileData(updatedProfileData);
    } else {
    }
  }, [userData]);


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
    if (!authData?.id) {
      alert('User ID not found. Please log in again.');
      return;
    }

    console.log('🔄 Starting profile update for user:', authData.id);
    console.log('📝 Update data:', {
      name: profileData.contactName,
      businessName: profileData.businessName,
      website: profileData.website,
      phoneNumber: profileData.phone,
      country: profileData.country,
      businessType: profileData.businessType,
      timeZone: profileData.timezone,
      description: profileData.businessDescription
    });

    setIsSaving(true);
    try {
      const updateData = {
        name: profileData.contactName,
        businessName: profileData.businessName,
        website: profileData.website,
        phoneNumber: profileData.phone,
        country: profileData.country,
        businessType: profileData.businessType,
        timeZone: profileData.timezone,
        description: profileData.businessDescription
      };

      // Use the usersAPI.updateProfile function
      console.log('🚀 Calling API to update profile...');
      const response = await usersAPI.updateProfile(authData.id, updateData);
      
      console.log('📤 API Response:', response);
      
      if (response.success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        // Update local storage immediately
        const currentStoredData = JSON.parse(localStorage.getItem('completeUserData') || '{}');
        const updatedStoredData = {
          ...currentStoredData,
          ...updateData,
          // Make sure we preserve the ID and other important fields
          id: currentStoredData.id,
          email: currentStoredData.email,
          _id: currentStoredData._id
        };
        
        localStorage.setItem('completeUserData', JSON.stringify(updatedStoredData));
        console.log('Updated localStorage with:', updatedStoredData);
        
        // Refresh the parent component's userData
        if (refreshUserData) {
          console.log('Calling refreshUserData...');
          await refreshUserData();
        }
        
        // Update the component's profileData state to reflect the changes immediately
        setProfileData(prev => ({
          ...prev,
          businessName: updateData.businessName,
          contactName: updateData.name,
          phone: updateData.phoneNumber,
          website: updateData.website,
          country: updateData.country,
          businessType: updateData.businessType,
          timezone: updateData.timeZone,
          businessDescription: updateData.description
        }));
        
      } else {
        console.error('❌ Profile update failed:', response.message);
        alert('Failed to update profile: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('Failed to update profile. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to the original userData when canceling
    if (userData) {
      setProfileData({
        businessName: userData.businessName || userData.name || '',
        contactName: userData.name || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
        website: userData.website || '',
        businessType: userData.businessType || 'E-commerce',
        country: userData.country || 'United States',
        timezone: userData.timeZone || 'America/New_York',
        businessDescription: userData.description || '',
        profileImage: userData.profileImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'
      });
    }
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
            <h4 className="font-medium text-text-primary">
              {profileData.contactName || 'No Name Set'}
            </h4>
            <p className="text-text-secondary text-sm">
              {profileData.businessName || 'No Business Name Set'}
            </p>
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
              <p className="text-text-primary py-2">
                {profileData.businessName || 'No business name set'}
              </p>
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
              <p className="text-text-primary py-2">
                {profileData.contactName || 'No contact name set'}
              </p>
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
              <p className="text-text-primary py-2">
                {profileData.email || 'No email set'}
              </p>
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
              <p className="text-text-primary py-2">
                {profileData.phone || 'No phone number set'}
              </p>
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
                {profileData.website ? (
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline">
                    {profileData.website}
                  </a>
                ) : (
                  'No website set'
                )}
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
              {profileData.businessDescription || 'No business description set'}
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