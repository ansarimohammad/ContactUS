import mongoose from 'mongoose';

// Cache the mongoose connection to reuse between API calls
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contact-form';

// Log MongoDB URI (but hide credentials for security)
const redactedUri = MONGODB_URI.replace(
  /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
  'mongodb$1://$2:***@'
);
console.log('MongoDB URI:', redactedUri);

// Function to connect to MongoDB
export async function connectToDatabase() {
  try {
    if (cached.conn) {
      console.log('Using existing MongoDB connection');
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
      };

      console.log('Creating new MongoDB connection promise');
      
      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('Connected to MongoDB successfully');
          console.log('MongoDB connection state:', mongoose.connection.readyState);
          console.log('MongoDB database name:', mongoose.connection.name);
          return mongoose;
        })
        .catch((error) => {
          console.error('Error connecting to MongoDB:', error);
          cached.promise = null; // Reset promise on error to allow retry
          throw error;
        });
    } else {
      console.log('Using existing MongoDB connection promise');
    }

    console.log('Awaiting MongoDB connection promise');
    cached.conn = await cached.promise;
    console.log('MongoDB connection established');
    return cached.conn;
  } catch (error) {
    console.error('Unexpected error in connectToDatabase:', error);
    throw error;
  }
} 