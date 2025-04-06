// Simple MongoDB connectivity test
// Run with: node src/lib/check-mongodb.mjs

import mongoose from 'mongoose';

// MongoDB URI - update this if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contact-form';

console.log('Testing MongoDB connection to:', MONGODB_URI);

mongoose.connect(MONGODB_URI, { 
  serverSelectionTimeoutMS: 5000 
})
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Connected to database:', mongoose.connection.name);
    
    // Create a simple test document
    const TestSchema = new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('TestModel', TestSchema);
    
    return Test.create({ name: 'Connection Test' })
      .then(doc => {
        console.log('✅ Successfully created test document with ID:', doc._id);
        return mongoose.connection.close();
      });
  })
  .then(() => {
    console.log('Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }); 