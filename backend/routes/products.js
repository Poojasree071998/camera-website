const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

// Create Product (Vendor only)
router.post('/', auth, authorize('vendor'), async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            vendor: req.user._id,
            isApproved: false // Requires admin approval
        });
        await product.save();
        res.status(201).send(product);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get all approved products (Public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isApproved: true }).populate('vendor', 'name');
        res.send(products);
    } catch (e) {
        res.status(500).send();
    }
});

// Get all products (Admin only)
router.get('/admin', auth, authorize('admin'), async (req, res) => {
    try {
        const products = await Product.find({}).populate('vendor', 'name');
        res.send(products);
    } catch (e) {
        res.status(500).send();
    }
});

// Approve Product (Admin only)
router.patch('/approve/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        if (!product) return res.status(404).send();
        res.send(product);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get vendor's own products (Vendor only)
router.get('/vendor', auth, authorize('vendor'), async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user._id });
        res.send(products);
    } catch (e) {
        res.status(500).send();
    }
});

// Delete Product (Vendor - own product, or Admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const filter = req.user.role === 'admin'
            ? { _id: req.params.id }
            : { _id: req.params.id, vendor: req.user._id };
        const product = await Product.findOneAndDelete(filter);
        if (!product) return res.status(404).send({ error: 'Product not found or not authorized.' });
        res.send(product);
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;
