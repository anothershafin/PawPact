const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // This looks for backend/config/db.js

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// This looks for backend/routes/userRoutes.js
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.send("PawPact API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});