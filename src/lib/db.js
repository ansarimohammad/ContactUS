import mongoose from 'mongoose';

// Check if MongoDB URI is defined
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with improved security options
 */
export async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // Connection pooling
      maxPoolSize: 10,
      minPoolSize: 5,
      
      // Timeouts for better resilience
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      
      // Retry logic
      retryWrites: true,
      retryReads: true,
      
      // Default to using the new server discovery and monitoring engine
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // TLS/SSL settings (important for production)
      ssl: process.env.NODE_ENV === 'production',
      tls: process.env.NODE_ENV === 'production',
      
      // If connecting to Atlas, these should be enabled
      ...(process.env.MONGODB_URI.includes('mongodb+srv') && {
        authSource: 'admin',
        w: 'majority',
      }),
    };

    // Start connection attempt
    try {
      cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    } catch (e) {
      // Reset the promise to allow future connection attempts
      cached.promise = null;
      throw e;
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

/**
 * Disconnect from MongoDB - useful for tests
 */
export async function disconnect() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

// Handle shutdown gracefully
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, async () => {
    if (cached.conn) {
      await disconnect();
    }
    process.exit(0);
  });
}); 