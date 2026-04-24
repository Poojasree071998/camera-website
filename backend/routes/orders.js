const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { auth, authorize } = require('../middleware/auth');

const PLATFORM_FEE_PCT = 0.10; // 10% platform commission

// ── Create Order (Customer) → auto-create Transactions ─────────
router.post('/', auth, authorize('customer'), async (req, res) => {
    try {
        const items = req.body.items || [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // Accommodate 'productId' or 'product'
            item.product = item.product || item.productId;
            try {
                const prod = await Product.findById(item.product);
                if (prod && prod.vendor) {
                    item.vendor = prod.vendor;
                }
            } catch (err) {}
        }
        
        const order = new Order({ ...req.body, items, customer: req.user._id });
        await order.save();

        // Auto-create a Transaction for each item
        const txnDocs = [];
        for (const item of order.items) {
            // Try to get product details (best-effort)
            let productName = 'Product';
            let vendorId = item.vendor;
            try {
                const product = await Product.findById(item.product).populate('vendor', 'name');
                if (product) {
                    productName = product.name;
                    if (!vendorId) {
                        vendorId = product.vendor ? product.vendor._id : null;
                    }
                }
            } catch (_) {}

            const gross = item.price * item.quantity;
            const fee   = Math.round(gross * PLATFORM_FEE_PCT);
            const net   = gross - fee;

            txnDocs.push({
                orderId:     order._id,
                vendorId:    vendorId || null,
                productName,
                productId:   item.product,
                grossAmount: gross,
                platformFee: fee,
                netAmount:   net,
            });
        }

        if (txnDocs.length) await Transaction.insertMany(txnDocs);

        // Decrement stock for each item
        for (const item of order.items) {
            try {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            } catch (err) {
                console.error('Failed to decrement stock for product:', item.product, err);
            }
        }

        res.status(201).send(order);
    } catch (e) {
        res.status(400).send(e);
    }
});

// ── My Orders (Customer / Vendor) ───────────────────────────────
router.get('/my-orders', auth, async (req, res) => {
    try {
        const query = { customer: req.user._id };
        const orders = await Order.find(query)
            .populate('items.product', 'name price')
            .populate('items.vendor', 'name email')
            .populate('customer', 'name');
        res.send(orders);
    } catch (e) {
        res.status(500).send();
    }
});

// ── All Orders (Admin) ──────────────────────────────────────────
router.get('/admin', auth, authorize('admin'), async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('items.product', 'name price')
            .populate('items.vendor', 'name email')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        res.send(orders);
    } catch (e) {
        res.status(500).send();
    }
});

// ── Vendor Orders (orders containing vendor's products) ─────────
router.get('/vendor', auth, authorize('vendor'), async (req, res) => {
    try {
        const orders = await Order.find({ 'items.vendor': req.user._id })
            .populate('items.product', 'name price')
            .populate('items.vendor', 'name email')
            .populate('customer', 'name') // Only populate name, not email or other details
            .sort({ createdAt: -1 });

        // Heavily restrict order data for vendors
        const restrictedOrders = orders.map(order => {
            const o = order.toObject();
            delete o.shippingAddress;
            delete o.customerName;
            delete o.customerEmail;
            delete o.phone;
            if (o.customer) {
                o.customer = { name: o.customer.name }; // Ensure only name is present
            }
            return o;
        });

        res.send(restrictedOrders);
    } catch (e) {
        res.status(500).send();
    }
});

// ── Update Order Status ─────────────────────────────────────────
router.patch('/:id/status', auth, authorize(['admin', 'vendor', 'delivery']), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!order) return res.status(404).send();
        res.send(order);
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;
