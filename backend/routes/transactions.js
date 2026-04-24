const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth, authorize } = require('../middleware/auth');

// ── Vendor: own transactions ────────────────────────────────────
router.get('/vendor', auth, authorize('vendor'), async (req, res) => {
    try {
        const txns = await Transaction.find({ vendorId: req.user._id })
            .sort({ createdAt: -1 });
        res.send(txns);
    } catch (e) {
        res.status(500).send();
    }
});

// ── Admin: all transactions ─────────────────────────────────────
router.get('/admin', auth, authorize('admin'), async (req, res) => {
    try {
        const txns = await Transaction.find({})
            .populate('vendorId', 'name email')
            .sort({ createdAt: -1 });
        res.send(txns);
    } catch (e) {
        res.status(500).send();
    }
});

// ── Admin: settle a transaction ─────────────────────────────────
router.patch('/:id/settle', auth, authorize('admin'), async (req, res) => {
    try {
        const txn = await Transaction.findByIdAndUpdate(
            req.params.id,
            { paymentStatus: 'settled' },
            { new: true }
        );
        if (!txn) return res.status(404).send({ error: 'Transaction not found' });
        res.send(txn);
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;
