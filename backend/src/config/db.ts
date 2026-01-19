import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDb(): Promise<void> {
  console.log('Mongo URI:', env.mongoUri)
  if (!env.mongoUri) {
    // eslint-disable-next-line no-console
    console.warn('MONGO_URI is not set; database will not connect.')
    return
  }

  try {
    await mongoose.connect(env.mongoUri)
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed. Set MONGO_URI or start MongoDB.', err)
    if ((env.nodeEnv ?? 'development') === 'production') throw err
  }
}