// MongoDB Atlas connection test script
// Run with: node src/lib/atlas-test.mjs
import mongoose from 'mongoose';

// Replace with your actual MongoDB Atlas connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohammad:ahmad1122@contactus.udebcps.mongodb.net/contact-form';

console.log('\n🔍 Testing MongoDB Atlas connection...');
console.log('Connection URI (redacted):',
  MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@'));

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('Connected to database:', mongoose.connection.db.databaseName);
    
    // Define test schema and model
    const TestSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.models.MongoTest || mongoose.model('MongoTest', TestSchema);
    
    console.log('\n📝 Creating test document...');
    const testDoc = await Test.create({
      name: 'Atlas Test ' + new Date().toISOString()
    });
    
    console.log('✅ Test document created with ID:', testDoc._id);
    
    // List all collections
    console.log('\n📋 Listing all collections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in each collection
    console.log('\n🔢 Counting documents in each collection:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n👋 Connection closed successfully.');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err);
    process.exit(1);
  }); 