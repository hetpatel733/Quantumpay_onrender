const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    businessEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        ref: 'User'
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    amountUSD: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { 
    timestamps: true 
});

// Add indexes for performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ businessEmail: 1, isActive: 1 });
orderSchema.index({ businessEmail: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
