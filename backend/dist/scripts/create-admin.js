import 'dotenv/config';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
async function createAdmin() {
    try {
        await connectDb();
        const email = 'admin@example.com';
        const password = 'password123';
        const name = 'System Admin';
        // Check if exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Admin already exists:');
            console.log('Email:', email);
            console.log('Password: (if you did not change it) password123');
            process.exit(0);
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const admin = await User.create({
            email,
            passwordHash,
            name,
            role: 'admin',
            subscriptionPlan: 'PLATINUM', // Admins get full access
            subscriptionStatus: 'active'
        });
        console.log('Admin created successfully:');
        console.log('Email:', admin.email);
        console.log('Password:', password);
    }
    catch (err) {
        console.error('Failed to create admin:', err);
    }
    finally {
        process.exit(0);
    }
}
createAdmin();
