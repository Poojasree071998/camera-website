const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/camera-marketplace';

const seedUsers = [
    {
        name: 'Super Admin',
        email: 'admin@lenscraft.com',
        password: 'Admin@123',
        role: 'admin'
    },
    {
        name: 'Camera Vendor',
        email: 'vendor@lenscraft.com',
        password: 'Vendor@123',
        role: 'vendor'
    },
    {
        name: 'Alex Customer',
        email: 'customer@lenscraft.com',
        password: 'Customer@123',
        role: 'customer'
    },
    {
        name: 'Technician',
        email: 'technician@lenscraft.com',
        password: 'Tech@123',
        role: 'delivery'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users.');

        // Add new users (password hashing is handled by User.pre('save'))
        for (const user of seedUsers) {
            const newUser = new User(user);
            await newUser.save();
            console.log(`Created user: ${user.email} (${user.role})`);
        }

        console.log('Database seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seedDB();
