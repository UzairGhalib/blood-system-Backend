const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn("MONGO_URI is not set. Server will continue without a database connection.");
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("=================================");
    console.log("MongoDB Atlas connected successfully");
    console.log(`Database host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log("=================================");
    return true;
  } catch (error) {
    console.error("=================================");
    console.error("MongoDB connection failed");
    console.error(error.message);
    console.error("Your Atlas IP may not be whitelisted. Add your current IP in MongoDB Atlas or use a local MongoDB instance.");
    console.error("=================================");
    return false;
  }
};

module.exports = connectDB;
