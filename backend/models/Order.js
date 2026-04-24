const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            vendor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            quantity: { type: Number, required: true },
            price:    { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    commission: { type: Number, default: 0 }, // Platform commission
    status: {
        type: String,
        enum: ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: { type: String, required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
