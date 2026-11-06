import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[DB] Connected successfully to MongoDB at ${uri.replace(/\/\/.*@/, '//***@')}`);
      return uri;
    } catch (err: any) {
      console.warn(`[DB] Connection to external MongoDB failed (${err.message}). Falling back to MongoMemoryServer...`);
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

