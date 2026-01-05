import { User } from '../models/User.js';
import { env } from '../config/env.js';
export async function attachUserDoc(req, res, next) {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!env.mongoUri) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const doc = await User.findById(req.user.id);
    if (!doc) {
        return res.status(404).json({ error: 'User not found' });
    }
    req.userDoc = doc;
    return next();
}
