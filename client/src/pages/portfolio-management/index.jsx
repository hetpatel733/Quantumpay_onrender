// src/pages/portfolio-management/index.jsx
import React, { useState } from 'react';
import Icon from 'components/AppIcon';

import ItemFormModal from './components/ItemFormModal';
import ItemCard from './components/ItemCard';

const PortfolioManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: 'item_001',
      name: 'Premium Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 199.99,
      cryptoPrice: { type: 'Bitcoin', symbol: 'BTC', amount: 0.00512 },
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=350&fit=crop',
      address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
      status: 'active',
      salesCount: 24,
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'item_002',
      name: 'Smart Fitness Watch',
      description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring and GPS.',
      price: 149.50,
      cryptoPrice: { type: 'Ethereum', symbol: 'ETH', amount: 0.0845 },
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?w=500&h=350&fit=crop',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      status: 'active',
      salesCount: 18,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'item_003',
      name: 'Portable Power Bank',
      description: '20,000mAh high-capacity power bank with fast charging capabilities for all your devices.',
      price: 49.99,
      cryptoPrice: { type: 'USDT', symbol: 'USDT', amount: 49.99 },
      image: 'https://images.pixabay.com/photo/2018/01/24/17/33/light-bulb-3104355_1280.jpg?w=500&h=350&fit=crop',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      status: 'inactive',
      salesCount: 7,
      createdAt: new Date('2024-02-01')
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'newest'
  });

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (itemId) => {
    setPortfolioItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleSaveItem = (itemData) => {
    if (selectedItem) {
      // Edit existing item
      setPortfolioItems(prevItems => 
        prevItems.map(item => item.id === selectedItem.id ? { ...item, ...itemData } : item)
      );
    } else {
      // Add new item
      const newItem = {
        id: `item_${Date.now()}`,
        ...itemData,
        salesCount: 0,
        createdAt: new Date()
      };
      setPortfolioItems(prevItems => [...prevItems, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (itemId) => {
    setPortfolioItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            status: item.status === 'active' ? 'inactive' : 'active'
          };
        }
        return item;
      })
    );
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusFilterChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  // Filter and sort items
  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                           item.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch(filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price-high':
        return b.price - a.price;
      case 'price-low':
        return a.price - b.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="p-4 lg:p-6 bg-background min-h-screen overflow-x-hidden max-w-full">
      <div className="max-w-8xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-semibold text-text-primary">Portfolio Management</h1>
              <p className="text-text-secondary mt-1 text-sm lg:text-base">Manage your product catalog for cryptocurrency payments</p>
            </div>
            <button 
              onClick={handleAddItem}
              className="
                flex items-center justify-center space-x-2 px-4 py-2
                bg-primary text-white rounded-lg
                hover:bg-primary-700 transition-smooth
                text-sm lg:text-base
                w-full sm:w-auto
              "
            >
              <Icon name="Plus" size={16} color="currentColor" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Items</p>
                  <p className="text-xl lg:text-2xl font-semibold text-text-primary">{portfolioItems.length}</p>
                </div>
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="ShoppingBag" size={20} color="var(--color-primary)" />
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Active Items</p>
                  <p className="text-xl lg:text-2xl font-semibold text-success">
                    {portfolioItems.filter(item => item.status === 'active').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle" size={20} color="var(--color-success)" />
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Sales</p>
                  <p className="text-xl lg:text-2xl font-semibold text-text-primary">
                    {portfolioItems.reduce((total, item) => total + item.salesCount, 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="TrendingUp" size={20} color="var(--color-text-primary)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg border border-border p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Search Items
              </label>
              <div className="relative">
                <Icon 
                  name="Search" 
                  size={16} 
                  color="currentColor"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="
                    w-full pl-10 pr-4 py-2
                    bg-background border border-border rounded-lg
                    text-text-primary placeholder-text-secondary
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-smooth text-sm
                  "
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={handleStatusFilterChange}
                className="
                  w-full px-3 py-2
                  bg-background border border-border rounded-lg
                  text-text-primary text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-smooth
                "
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="
                  w-full px-3 py-2
                  bg-background border border-border rounded-lg
                  text-text-primary text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-smooth
                "
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-secondary">
              Showing {sortedItems.length} of {portfolioItems.length} items
            </p>
          </div>
        </div>

        {/* Items Grid */}
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {sortedItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEditItem(item)} 
                onDelete={() => handleDeleteItem(item.id)}
                onToggleStatus={() => handleToggleStatus(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-lg border border-border p-8 lg:p-10 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center">
                <Icon name="PackageOpen" size={32} color="var(--color-text-secondary)" />
              </div>
              <h3 className="text-lg lg:text-xl font-medium text-text-primary">No items found</h3>
              <p className="text-text-secondary max-w-md mx-auto text-sm lg:text-base">
                {portfolioItems.length === 0 
                  ? "You haven't added any items to your portfolio yet. Click 'Add Item' to get started." :"No items match your current filters. Try adjusting your search criteria."}
              </p>
              {portfolioItems.length === 0 && (
                <button 
                  onClick={handleAddItem}
                  className="
                    mt-2 flex items-center space-x-2 px-4 py-2
                    bg-primary text-white rounded-lg
                    hover:bg-primary-700 transition-smooth
                    text-sm lg:text-base
                  "
                >
                  <Icon name="Plus" size={16} color="currentColor" />
                  <span>Add Your First Item</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      <ItemFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        item={selectedItem}
      />
    </div>
  );
};

export default PortfolioManagement;