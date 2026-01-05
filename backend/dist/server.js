import 'dotenv/config';
import { app } from './index.js';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
async function start() {
    await connectDb();
    app.listen(env.port, () => {
        console.log(`API listening on port ${env.port}`);
    });
}
void start();
