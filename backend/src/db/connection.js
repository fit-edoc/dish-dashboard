const mongoose = require('mongoose');

async function connectDB(uri) {
  const connectionUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/dish-management';
  try {
    const conn = await mongoose.connect(connectionUri);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
}

module.exports = connectDB;
