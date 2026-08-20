const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
const donorRoutes = require("./routes/donorRoutes");
const profileRoutes = require("./routes/profileRoutes");
const requesterRoutes = require("./routes/requesterRoutes");

const app = express();
const serverPort = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5173,http://localhost:5174",
]
  .filter(Boolean)
  .join(",")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("This frontend origin is not allowed by CORS."));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BloodLink backend is running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      bloodRequests: "/api/blood-requests",
      donors: "/api/donors",
      profile: "/api/profile",
      requesters: "/api/requesters",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: `BloodLink backend is running on port ${serverPort}`,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/requesters", requesterRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
