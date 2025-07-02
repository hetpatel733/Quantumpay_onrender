import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const Header = ({ userData }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hideMobileSearch, setHideMobileSearch] = useState(false);
  const dropdownRef = useRef(null);


  const profileMenuItems = [
    {
      label: 'Account Settings',
      icon: 'Settings',
      action: () => {
        // Navigate to account settings
        window.location.href = '/account-settings';
      }
    },
    {
      label: 'Help & Support',
      icon: 'HelpCircle',
      action: () => {
        // Open help documentation
        console.log('Opening help documentation');
      }
    },
    {
      label: 'Sign Out',
      icon: 'LogOut',
      action: () => {
        // Handle logout
        console.log('Signing out user');
      },
      variant: 'danger'
    }
  ];

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleProfileMenuClick = (item) => {
    item.action();
    setIsProfileOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hide mobile search button if sidebar is open on mobile
  useEffect(() => {
    const handleSidebarState = () => {
      // Check if sidebar is open on mobile by inspecting the sidebar element
      const sidebar = document.querySelector('aside');
      const isMobile = window.innerWidth < 1024;
      if (sidebar && isMobile) {
        // Sidebar is open if it does NOT have -translate-x-full
        setHideMobileSearch(!sidebar.className.includes('-translate-x-full'));
      } else {
        setHideMobileSearch(false);
      }
    };

    // Listen for sidebar open/close and window resize
    window.addEventListener('resize', handleSidebarState);
    const observer = new MutationObserver(handleSidebarState);
    const sidebar = document.querySelector('aside');
    if (sidebar) observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

    handleSidebarState();

    return () => {
      window.removeEventListener('resize', handleSidebarState);
      if (sidebar) observer.disconnect();
    };
  }, []);

  // Display user information in the header
  const displayName = userData?.name || userData?.uname || userData?.email || 'User';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="
      fixed top-0 right-0 h-16
      left-0 lg:left-60 
      bg-surface border-b border-border 
      px-4 lg:px-6 z-50
      transition-layout
    ">
      <div className="flex items-center justify-between h-16">
        {/* Left Section - Search or Title */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile spacing for menu button */}
          <div className="w-10 lg:w-0"></div>
          
          <div className="hidden sm:block flex-1 max-w-md">
            <div className="relative">
              <Icon 
                name="Search" 
                size={18} 
                color="currentColor"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder="Search transactions..."
                className="
                  w-full pl-10 pr-4 py-2
                  bg-background border border-border rounded-lg
                  text-text-primary placeholder-text-secondary
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-colors duration-200 text-sm h-9
                "
              />
            </div>
          </div>
        </div>

        {/* Right Section - Notifications and Profile */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* Mobile Search Button */}
          {!hideMobileSearch && (
            <button className="
              sm:hidden p-2 rounded-lg
              hover:bg-secondary-100 transition-colors duration-200
              text-text-secondary hover:text-text-primary
            ">
              <Icon name="Search" size={18} color="currentColor" />
            </button>
          )}

          {/* Notifications */}
          <button className="
            relative p-2 rounded-lg
            hover:bg-secondary-100 transition-colors duration-200
            text-text-secondary hover:text-text-primary
          ">
            <Icon name="Bell" size={18} color="currentColor" />
            <span className="
              absolute -top-1 -right-1 
              w-3 h-3 bg-error rounded-full
              flex items-center justify-center
            ">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className="
                flex items-center space-x-2 lg:space-x-3 p-2 rounded-lg
                hover:bg-secondary-100 transition-colors duration-200
                text-text-primary h-10
              "
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {userInitials}
                </span>
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <p className="text-sm font-medium text-text-primary truncate mb-2 mt-3">{displayName}</p>
                <p className="text-xs text-text-secondary truncate">Business Owner</p>
              </div>
              <Icon 
                name="ChevronDown" 
                size={16} 
                color="currentColor"
                className={`transition-transform duration-200 hidden lg:block ${isProfileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="
                absolute right-0 top-full mt-2 w-64
                bg-surface border border-border rounded-lg shadow-lg
                py-2 z-50
              ">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
                  <p className="text-xs text-text-secondary truncate">{userData?.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {profileMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleProfileMenuClick(item)}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-2
                        hover:bg-secondary-100 transition-colors duration-200 text-left
                        ${item.variant === 'danger' ? 'text-error hover:bg-error-50' : 'text-text-primary'}
                      `}
                    >
                      <Icon 
                        name={item.icon} 
                        size={16} 
                        color="currentColor"
                      />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;