require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const verificationRoutes = require("./src/routes/verification.routes");
const attestationRoutes = require("./src/routes/attestation.routes");
const governmentRoutes = require("./src/routes/government.routes");
const employerRoutes = require("./src/routes/employer.routes");
const authRoutes = require("./src/routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/verify", verificationRoutes);
app.use("/api/v1/attestation", attestationRoutes);
app.use("/api/v1/government", governmentRoutes);
app.use("/api/v1/employer", employerRoutes);
app.use("/api/v1/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
  });
});

// Database connection
mongoose
  .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/verified-resume", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✓ Connected to MongoDB");
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ API available at http://localhost:${PORT}/api/v1`);
    });
  })
  .catch((error) => {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  });

module.exports = app;

