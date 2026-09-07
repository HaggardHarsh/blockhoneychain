const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/honeychain';
    
    // Check if we want to force memory DB or if local connection fails
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('MongoDB Connected to:', uri);
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Failed to connect to Production MongoDB!', err.message);
        throw err;
      }
      console.log('Local MongoDB not found or timed out, starting in-memory DB...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB Memory Server connected at:', uri);
    }
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
