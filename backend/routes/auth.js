const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Demo Credentials Fallback
const demoUsers = {
    'admin@lenscraft.com': { _id: 'mock_admin', name: 'Super Admin', role: 'admin', password: 'Admin@123' },
    'vendor@lenscraft.com': { _id: 'mock_vendor', name: 'Camera Vendor', role: 'vendor', password: 'Vendor@123' },
    'customer@lenscraft.com': { _id: 'mock_customer', name: 'Alex Customer', role: 'customer', password: 'Customer@123' },
    'technician@lenscraft.com': { _id: 'mock_delivery', name: 'Technician', role: 'delivery', password: 'Tech@123' }
};

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Try DB first
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
            return res.send({ user, token });
        }

        // Fallback to Demo Credentials
        if (demoUsers[email] && demoUsers[email].password === password) {
            const { password: _, ...userData } = demoUsers[email];
            const token = jwt.sign({ _id: userData._id }, process.env.JWT_SECRET);
            return res.send({ user: userData, token });
        }

        res.status(400).send({ error: 'Invalid login credentials' });
    } catch (e) {
        // Also fallback on DB error (e.g. no mongo running)
        if (demoUsers[email] && demoUsers[email].password === password) {
            const { password: _, ...userData } = demoUsers[email];
            const token = jwt.sign({ _id: userData._id }, process.env.JWT_SECRET);
            return res.send({ user: userData, token });
        }
        res.status(500).send({ error: 'Server error' });
    }
});

module.exports = router;
