import mongoose from 'mongoose';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './env.js';

const uri = "mongodb+srv://Abin:<db_Abin>@fts.ezntmoy.mongodb.net/?appName=fts";

export async function connectDb() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    await client.close();
    throw error;
  }
}
