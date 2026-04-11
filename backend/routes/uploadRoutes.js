const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const { getPort } = require("../config/port");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");

const extFromMime = (mime) => {
  if (!mime) return "";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return "";
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (e) {
      cb(e);
    }
  },
  filename: (_req, file, cb) => {
    const extFromName = path.extname(file.originalname || "").toLowerCase();
    const allowed = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
    const ext =
      allowed.includes(extFromName) ? extFromName : extFromMime(file.mimetype) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image uploads are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const relative = `/uploads/${req.file.filename}`;
  const origin = process.env.PUBLIC_ORIGIN || `http://localhost:${getPort()}`;
  res.status(201).json({ url: `${origin}${relative}`, path: relative });
});

module.exports = router;

