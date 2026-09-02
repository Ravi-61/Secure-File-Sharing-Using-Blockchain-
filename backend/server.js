const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

// Routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const blockchainRoutes = require("./routes/blockchainRoutes");
const shareRoutes = require("./routes/shareRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Middlewares
const errorHandler = require("./middleware/errorHandler");
const idsMiddleware = require("./middleware/idsMiddleware");

const app = express();

// Global Security & Body Parsing
app.use(cors());
app.use(express.json());
app.use(idsMiddleware);

// Connect Database
connectDB();

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "running",
    system: "Blockchain-Based Secure File Sharing System",
    version: "2.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[SERVER] Secure File Sharing System running on port ${PORT}`);
});

module.exports = app;
