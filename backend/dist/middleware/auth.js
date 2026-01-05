import { verifyAccessToken } from '../services/jwt.js';
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        console.debug(`requireAuth: missing or invalid Authorization header; value=${String(header)}`);
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = header.slice('Bearer '.length);
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            role: payload.role,
            subscriptionPlan: payload.subscriptionPlan
        };
        return next();
    }
    catch {
        console.debug('requireAuth: token verification failed');
        return res.status(401).json({ error: 'Invalid token' });
    }
}
export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        return next();
    };
}
