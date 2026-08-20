require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const defaultPort = Number(process.env.PORT) || 5000;

const startServer = async () => {
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in production.");
  }

  const dbConnected = await connectDB();

  if (!dbConnected && process.env.NODE_ENV === "production") {
    throw new Error("MongoDB must be connected before the production server starts.");
  }

  if (!dbConnected) {
    console.warn("Starting the local server without MongoDB. Database features are unavailable.");
  }

  const server = http.createServer(app);

  server.on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });

  server.listen(defaultPort, "0.0.0.0", () => {
    console.log(`BloodLink backend running on port ${defaultPort}`);
  });

  const shutDown = () => {
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", shutDown);
  process.on("SIGINT", shutDown);
};

startServer().catch((error) => {
  console.error("Unable to start BloodLink backend:", error.message);
  process.exit(1);
});
