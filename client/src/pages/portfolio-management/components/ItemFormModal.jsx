// src/pages/portfolio-management/components/ItemFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ItemFormModal = ({ isOpen, onClose, onSave, item = null }) => {
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cryptoType: 'Bitcoin',
    cryptoAmount: '',
    address: '',
    image: '',
    status: 'active'
  });

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        cryptoType: item.cryptoPrice?.type || 'Bitcoin',
        cryptoAmount: item.cryptoPrice?.amount?.toString() || '',
        address: item.address || '',
        image: item.image || '',
        status: item.status || 'active'
      });
    } else {
      // Reset form for new item
      setFormData({
        name: '',
        description: '',
        price: '',
        cryptoType: 'Bitcoin',
        cryptoAmount: '',
        address: '',
        image: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [item, isOpen]);

  const cryptocurrencyOptions = [
    { value: 'Bitcoin', label: 'Bitcoin (BTC)', symbol: 'BTC' },
    { value: 'Ethereum', label: 'Ethereum (ETH)', symbol: 'ETH' },
    { value: 'USDT', label: 'Tether (USDT)', symbol: 'USDT' },
    { value: 'USDC', label: 'USD Coin (USDC)', symbol: 'USDC' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.cryptoAmount) {
      newErrors.cryptoAmount = 'Cryptocurrency amount is required';
    } else if (isNaN(formData.cryptoAmount) || parseFloat(formData.cryptoAmount) <= 0) {
      newErrors.cryptoAmount = 'Amount must be a positive number';
    }
    
    if (!formData.address) {
      newErrors.address = 'Wallet address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const selectedCrypto = cryptocurrencyOptions.find(option => option.value === formData.cryptoType);
      
      onSave({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cryptoPrice: {
          type: formData.cryptoType,
          symbol: selectedCrypto?.symbol,
          amount: parseFloat(formData.cryptoAmount)
        },
        address: formData.address,
        image: formData.image,
        status: formData.status
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange('image', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange('image', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle escape key and backdrop click
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleBackdropClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleBackdropClick);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleBackdropClick);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-smooth" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="
          relative bg-surface rounded-lg shadow-dropdown
          w-full max-w-2xl max-h-[90vh] overflow-hidden
          transition-layout
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name={item ? 'Edit' : 'Plus'} size={24} color="currentColor" className="text-primary" />
            <h2 className="text-xl font-semibold text-text-primary">
              {item ? 'Edit Portfolio Item' : 'Add New Item'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              hover:bg-secondary-100 transition-smooth
              text-text-secondary hover:text-text-primary
            "
          >
            <Icon name="X" size={20} color="currentColor" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Product Image
              </label>
              <div 
                className={`
                  border-2 border-dashed rounded-lg p-4 text-center
                  ${isDragging ? 'border-primary bg-primary-50' : 'border-border'}
                  ${errors.image ? 'border-error' : ''}
                  transition-smooth
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {formData.image ? (
                  <div className="relative w-full aspect-video max-h-48 mx-auto">
                    <Image 
                      src={formData.image} 
                      alt="Product preview" 
                      className="w-full h-full object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('image', '')}
                      className="
                        absolute top-2 right-2 p-1 rounded-full
                        bg-error text-white
                        hover:bg-error-700 transition-smooth
                      "
                    >
                      <Icon name="X" size={16} color="currentColor" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <Icon 
                      name="Image" 
                      size={40} 
                      color="currentColor" 
                      className="mx-auto text-text-secondary mb-2"
                    />
                    <p className="text-text-secondary mb-2">Drag and drop an image here, or click to browse</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="
                        inline-block px-4 py-2 bg-secondary-100 rounded-lg
                        text-text-primary hover:bg-secondary-200 transition-smooth
                        cursor-pointer
                      "
                    >
                      Browse Files
                    </label>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-error">{errors.image}</p>
              )}
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`
                    w-full px-3 py-2 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    text-text-primary bg-background
                    ${errors.name ? 'border-error' : 'border-border'}
                  `}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error">{errors.name}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="
                    w-full px-3 py-2 border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    text-text-primary bg-background resize-none
                  "
                  placeholder="Describe your product"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Price (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-text-secondary">$</span>
                  </div>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`
                      w-full pl-8 pr-3 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                      text-text-primary bg-background
                      ${errors.price ? 'border-error' : 'border-border'}
                    `}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-error">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => handleInputChange('status', 'active')}
                      className="form-radio text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="ml-2 text-text-primary">Active</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => handleInputChange('status', 'inactive')}
                      className="form-radio text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="ml-2 text-text-primary">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Cryptocurrency Details */}
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">Cryptocurrency Payment Details</h3>
              <div className="bg-background rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Cryptocurrency *
                    </label>
                    <select
                      value={formData.cryptoType}
                      onChange={(e) => handleInputChange('cryptoType', e.target.value)}
                      className="
                        w-full px-3 py-2 border border-border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                        text-text-primary bg-surface
                      "
                    >
                      {cryptocurrencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Crypto Amount *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cryptoAmount}
                        onChange={(e) => handleInputChange('cryptoAmount', e.target.value)}
                        className={`
                          w-full px-3 py-2 border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                          text-text-primary bg-surface
                          ${errors.cryptoAmount ? 'border-error' : 'border-border'}
                        `}
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-text-secondary">
                          {cryptocurrencyOptions.find(option => option.value === formData.cryptoType)?.symbol}
                        </span>
                      </div>
                    </div>
                    {errors.cryptoAmount && (
                      <p className="mt-1 text-sm text-error">{errors.cryptoAmount}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                      text-text-primary bg-surface font-mono text-sm
                      ${errors.address ? 'border-error' : 'border-border'}
                    `}
                    placeholder={formData.cryptoType === 'Bitcoin' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-error">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 border border-border rounded-lg
                text-text-secondary hover:text-text-primary
                hover:bg-secondary-100 transition-smooth
              "
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="
                px-4 py-2 bg-primary text-white rounded-lg
                hover:bg-primary-700 transition-smooth
                flex items-center space-x-2
              "
            >
              <Icon name="Save" size={16} color="currentColor" />
              <span>{item ? 'Update Item' : 'Add Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ItemFormModal;