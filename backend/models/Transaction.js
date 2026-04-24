const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    vendorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorName:    { type: String, default: 'Demo Vendor' },
    productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName:   { type: String, required: true },
    grossAmount:   { type: Number, required: true },   // full sale price
    platformFee:   { type: Number, required: true },   // 10% of gross
    netAmount:     { type: Number, required: true },   // gross - fee
    paymentStatus: {
        type: String,
        enum: ['pending', 'settled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
