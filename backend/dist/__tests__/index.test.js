
import request from 'supertest';
import { app } from '../index.js';
import { stripeService } from '../services/stripeService.js';
jest.mock('../config/db.js', () => ({
    connectDb: jest.fn(),
}));
jest.mock('../services/stripeService.js', () => ({
    stripeService: {
        handleWebhook: jest.fn(),
    },
}));
jest.mock('../models/User.js', () => ({
    User: {
        find: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
    },
}));
describe('Express App', () => {
    describe('GET /health', () => {
        it('should return 200 OK with status and timestamp', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'ok',
                service: 'fitness-backend',
                timestamp: expect.any(String),
            });
        });
    });
    describe('POST /subscriptions/webhook', () => {
        it('should call stripeService.handleWebhook and return 200', async () => {
            const payload = { type: 'test-event' };
            const sig = 'test-signature';
            const response = await request(app)
                .post('/subscriptions/webhook')
                .set('stripe-signature', sig)
                .send(payload);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ received: true });
            expect(stripeService.handleWebhook).toHaveBeenCalledWith(JSON.stringify(payload), sig);
        });
        it('should return 400 if stripeService.handleWebhook throws an error', async () => {
            const errorMessage = 'Webhook signature verification failed';
            stripeService.handleWebhook.mockRejectedValueOnce(new Error(errorMessage));
            const payload = { type: 'test-event-error' };
            const sig = 'test-signature-error';
            const response = await request(app)
                .post('/subscriptions/webhook')
                .set('stripe-signature', sig)
                .send(payload);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });
    describe('GET /_routes', () => {
        it('should return a list of expected routes', async () => {
            const response = await request(app).get('/_routes');
            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('path');
            expect(response.body[0]).toHaveProperty('methods');
        });
    });
});
