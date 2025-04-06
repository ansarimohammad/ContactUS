import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contact_management';

// Track connection status
let isConnected = false;

/**
 * Connect to MongoDB
 * @returns {Promise<typeof mongoose>} - Mongoose instance
 */
export async function connect() {
  // If already connected, return the existing connection
  if (isConnected) {
    return mongoose;
  }

  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(MONGODB_URI, options);
    isConnected = connection.connections[0].readyState === 1; // 1 = connected

    if (isConnected) {
      console.log('Connected to MongoDB');
    }

    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export async function disconnect() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
} 