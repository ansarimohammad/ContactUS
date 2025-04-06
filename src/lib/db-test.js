// This is a test script to ensure MongoDB connection works
// Run it with: node --experimental-json-modules src/lib/db-test.js

import { connectToDatabase } from './mongodb.js';
import mongoose from 'mongoose';

// Create a simple test schema
const TestSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

async function testConnection() {
  try {
    console.log('Environment check:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI || 'Not set in environment (will use default)');
    
    console.log('\nAttempting to connect to MongoDB...');
    const mongoose = await connectToDatabase();
    
    console.log('\nConnection successful!');
    console.log('MongoDB connection status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    console.log('MongoDB connection host:', mongoose.connection.host);
    console.log('MongoDB database name:', mongoose.connection.name);
    
    // Test creating a model and saving a document
    console.log('\nTesting document creation...');
    
    // Define the model (check if it exists first to avoid model overwrite error)
    const TestModel = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Create a test document
    const testDoc = new TestModel({ name: 'Test Document ' + new Date().toISOString() });
    console.log('Created test document in memory');
    
    // Save to database
    console.log('Saving test document to database...');
    await testDoc.save();
    console.log('Test document saved successfully with ID:', testDoc._id);
    
    // Test reading documents
    console.log('\nTesting document retrieval...');
    const docs = await TestModel.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Retrieved ${docs.length} test documents:`);
    docs.forEach(doc => {
      console.log(`- ${doc._id}: ${doc.name} (created: ${doc.createdAt})`);
    });
    
    // Close the connection
    console.log('\nClosing connection...');
    await mongoose.connection.close();
    console.log('Connection closed successfully.');
    
    console.log('\n✅ MongoDB connection and operations test PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB test FAILED:');
    console.error(error);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\nThis usually means:');
      console.error('1. MongoDB server is not running');
      console.error('2. MongoDB connection string is incorrect');
      console.error('3. Network issues preventing connection to MongoDB');
      console.error('\nPlease check that:');
      console.error('- MongoDB is installed and running');
      console.error('- Your MONGODB_URI in .env.local is correct');
      console.error('- If using MongoDB Atlas, your IP is whitelisted');
    }
    
    process.exit(1);
  }
}

testConnection(); 