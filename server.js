require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const defaultPort = Number(process.env.PORT) || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.log("Starting server without database connection. Some features may not work until MongoDB is reachable.");
  }

  const startOnPort = (port) => {
    const server = http.createServer(app);

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        const nextPort = port + 1;
        console.warn(`Port ${port} is busy. Retrying on port ${nextPort}...`);
        startOnPort(nextPort);
        return;
      }

      console.error("Server error:", error);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`BloodLink backend running on port ${port}`);
    });
  };

  startOnPort(defaultPort);
};

startServer();
