const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/queueease";
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    if (process.env.NODE_ENV === "test") {
      throw err;
    }

    return null;
  }
};

module.exports = connectDB;
