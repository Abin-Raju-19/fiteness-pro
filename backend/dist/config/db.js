import mongoose from 'mongoose';
import { env } from './env.js';
export async function connectDb() {
    if (!env.mongoUri) {
        // eslint-disable-next-line no-console
        console.warn('MONGO_URI is not set; database will not connect.');
        return;
    }
    await mongoose.connect(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
}
