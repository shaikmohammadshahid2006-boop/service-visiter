import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 7000,
      });
      console.log(`[DB] Connected successfully to MongoDB at ${uri.replace(/\/\/.*@/, '//***@')}`);
      return uri;
    } catch (err: any) {
      console.warn(`[DB] Connection to external MongoDB failed (${err.message}).`);
      console.warn(`[DB] Note: If using MongoDB Atlas on Render/cloud, ensure IP Access List allows 0.0.0.0/0 (Network Access in Atlas).`);
      console.warn(`[DB] Falling back to MongoMemoryServer for uninterrupted service...`);
    }
  }

  // Fallback to MongoMemoryServer for reliable, zero-config local dev & testing
  try {
    console.log(`[DB] Starting in-memory MongoDB instance...`);
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[DB] Connected successfully to in-memory MongoDB at ${memUri}`);
    return memUri;
  } catch (err: any) {
    console.error(`[DB] Failed to initialize in-memory database:`, err);
    throw err;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

