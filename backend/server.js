require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const path = require("path");

const verificationRoutes = require("./src/routes/verification.routes");
const attestationRoutes = require("./src/routes/attestation.routes");
const governmentRoutes = require("./src/routes/government.routes");
const employerRoutes = require("./src/routes/employer.routes");
const authRoutes = require("./src/routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for Vite dev
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || ["http://localhost:3000", "http://127.0.0.1:3000"],
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
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[dbStatus] || "unknown",
      connected: dbStatus === 1
    }
  });
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

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
  // Serve frontend for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    }
  });
}

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "API endpoint not found",
    },
  });
});

// Set up MongoDB connection event handlers (before connection attempt)
mongoose.connection.on('connected', () => {
  console.log('✓ MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected');
});

// Database connection with retry logic (non-blocking)
const connectDB = async () => {
  const maxRetries = 3;
  const retryDelay = 3000; // 3 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(
        process.env.DATABASE_URL || "mongodb://localhost:27017/verified-resume",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000, // Timeout after 3s
        }
      );
      console.log("✓ Connected to MongoDB");
      return;
    } catch (error) {
      if (attempt === 1) {
        console.warn(`⚠ MongoDB not available (${error.message})`);
        console.warn("⚠ Server will start without database connection");
        console.warn("⚠ Some features may not work until MongoDB is available");
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error("⚠ To start MongoDB:");
        console.error("   - Windows Service: net start MongoDB");
        console.error("   - Manual: mongod");
      }
    }
  }
};

// Start server immediately, connect to DB in background
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ API available at http://localhost:${PORT}/api/v1`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  
  // Try to connect to MongoDB in background (non-blocking)
  connectDB().catch(err => {
    // Error already handled in connectDB
  });
});

module.exports = app;

