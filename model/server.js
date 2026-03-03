const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// routes will be in controller/
const authRoutes = require("../controller/routes/auth.routes");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "PawPact API running" }));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});