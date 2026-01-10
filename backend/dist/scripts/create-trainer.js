import 'dotenv/config';
import { connectDb } from '../config/db.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
async function createTrainer() {
    try {
        await connectDb();
        const email = 'trainer@example.com';
        const password = 'password123';
        const name = 'Default Trainer';
        // Check if exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Trainer already exists:');
            console.log('Email:', email);
            console.log('Password: (if you did not change it) password123');
            // If we want to be sure, we could update the password here, but let's just exit
            process.exit(0);
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const trainer = await User.create({
            email,
            passwordHash,
            name,
            role: 'trainer',
            subscriptionPlan: 'PLATINUM', // Trainers usually get full access
            subscriptionStatus: 'active'
        });
        console.log('Trainer created successfully:');
        console.log('Email:', trainer.email);
        console.log('Password:', password);
    }
    catch (err) {
        console.error('Failed to create trainer:', err);
    }
    finally {
        process.exit(0);
    }
}
createTrainer();
