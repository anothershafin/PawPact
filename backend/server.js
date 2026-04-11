const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const ObservationContract = require("./models/ObservationContract");
const Pet = require("./models/Pet");
const multer = require("multer");
const { getPort } = require("./config/port");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware: Allow JSON data in request body
app.json = express.json();
app.use(express.json());

// Middleware: Allow frontend (React on port 3000) to talk to this API
app.use(cors());

const uploadsDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// ROUTES - map URLs to controllers
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/pets", require("./routes/petRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/shortlist", require("./routes/shortlistRoutes"));
app.use("/api/questionnaire", require("./routes/questionnaireRoutes"));
app.use("/api/contracts", require("./routes/contractRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// Global error handler (multer + other middleware errors)
app.use((err, _req, res, _next) => {
  void _next;
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large (max 5MB)" });
    }
    return res.status(400).json({ message: err.message });
  }
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ message });
});

// Test route to check if server is running
app.get("/", (req, res) => {
  res.send("PawPact API is running...");
});

const PORT = getPort();

// Minimal scheduler for FR-18 auto finalization
const startAutoFinalizeJob = () => {
  const intervalMs = 60 * 1000; // every minute
  setInterval(async () => {
    try {
      const now = new Date();
      const contracts = await ObservationContract.find({
        status: "active",
        endDate: { $lte: now },
      }).limit(25);

      for (const c of contracts) {
        // Auto-finalize only if no dispute/return requested and both confirmed
        if (c.adopterConfirmedAt && c.petParentConfirmedAt) {
          c.status = "closed_adopted";
          await c.save();
          const pet = await Pet.findById(c.pet);
          if (pet) {
            pet.adoptionStatus = "adopted";
            await pet.save();
          }
        }
      }
    } catch (e) {
      // keep server alive even if job errors
      // eslint-disable-next-line no-console
      console.error("Auto-finalize job error:", e.message);
    }
  }, intervalMs);
};

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PawPact API listening on http://localhost:${PORT}`);
  startAutoFinalizeJob();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(
      `\nPort ${PORT} is already in use.\n\n` +
        `Fix (pick one):\n` +
        `  1) Stop the other process using this port (often another "node" / old nodemon):\n` +
        `     netstat -ano | findstr :${PORT}\n` +
        `     taskkill /PID <pid> /F\n\n` +
        `  2) Use a different port — in backend/.env set PORT=5002\n` +
        `     In frontend/.env.development set:\n` +
        `     REACT_APP_PROXY_TARGET=http://localhost:5002\n\n` +
        `  3) Windows: Settings → System → For developers → disable "AirPlay Receiver" if it holds port 5000.\n`
    );
    process.exit(1);
  }
  throw err;
});
