// src/pages/portfolio-management/components/ItemCard.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ItemCard = ({ item, onEdit, onDelete, onToggleStatus }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCryptoIcon = (type) => {
    switch (type) {
      case 'Bitcoin':
        return 'Bitcoin';
      case 'Ethereum':
        return 'Zap';
      case 'USDT': case'USDC':
        return 'DollarSign';
      default:
        return 'Coins';
    }
  };

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      onDelete();
    } else {
      setIsConfirmingDelete(true);
      // Auto reset after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  return (
    <div className="
      bg-surface border border-border rounded-lg overflow-hidden
      hover:shadow-md transition-smooth flex flex-col
    ">
      {/* Status badge */}
      <div className="absolute top-3 right-3">
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${item.status === 'active' ? 'bg-success-100 text-success' : 'bg-secondary-100 text-text-secondary'}
        `}>
          <Icon 
            name={item.status === 'active' ? 'CheckCircle' : 'XCircle'} 
            size={12} 
            color="currentColor"
            className="mr-1"
          />
          {item.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Product Image */}
      <div className="relative w-full h-48 bg-secondary-50 overflow-hidden">
        <Image 
          src={item?.image} 
          alt={item?.name} 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-1">
          {item?.name}
        </h3>
        
        <p className="text-text-secondary text-sm mb-3 line-clamp-2 flex-1">
          {item?.description}
        </p>
        
        <div className="space-y-2">
          {/* Price */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Price:</span>
            <div className="text-right">
              <span className="font-medium text-text-primary">
                ${item?.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          
          {/* Crypto Price */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Crypto:</span>
            <div className="flex items-center space-x-1">
              <Icon 
                name={getCryptoIcon(item?.cryptoPrice?.type)} 
                size={14} 
                color="currentColor" 
                className="text-text-secondary"
              />
              <span className="text-text-primary text-sm font-mono">
                {item?.cryptoPrice?.amount} {item?.cryptoPrice?.symbol}
              </span>
            </div>
          </div>
          
          {/* Sales */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Sales:</span>
            <span className="text-text-primary">
              {item?.salesCount || 0}
            </span>
          </div>
          
          {/* Created Date */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Added:</span>
            <span className="text-text-secondary text-sm">
              {formatDate(item?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-background">
        <button
          onClick={onToggleStatus}
          className="
            flex items-center space-x-1 px-2 py-1
            text-text-secondary hover:text-text-primary
            hover:bg-secondary-100 rounded transition-smooth
          "
          title={item.status === 'active' ? 'Deactivate' : 'Activate'}
        >
          <Icon 
            name={item.status === 'active' ? 'EyeOff' : 'Eye'} 
            size={16} 
            color="currentColor" 
          />
          <span className="text-sm">
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </span>
        </button>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onEdit}
            className="
              p-2 hover:bg-secondary-100 rounded
              text-text-secondary hover:text-primary
              transition-smooth
            "
            title="Edit item"
          >
            <Icon name="Edit" size={16} color="currentColor" />
          </button>
          
          <button
            onClick={handleDeleteClick}
            className={`
              p-2 rounded transition-smooth
              ${isConfirmingDelete 
                ? 'bg-error-100 text-error hover:bg-error-200' :'hover:bg-secondary-100 text-text-secondary hover:text-error'}
            `}
            title={isConfirmingDelete ? 'Confirm delete' : 'Delete item'}
          >
            <Icon name={isConfirmingDelete ? 'AlertTriangle' : 'Trash2'} size={16} color="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;