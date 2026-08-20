const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn("MONGO_URI is not set.");
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
    console.error("Check the MongoDB Atlas connection string and Network Access settings.");
    console.error("=================================");
    return false;
  }
};

module.exports = connectDB;
