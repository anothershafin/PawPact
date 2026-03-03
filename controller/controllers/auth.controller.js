const bcrypt = require("bcryptjs");
const User = require("../../model/schemas/User");
const { signToken } = require("../utils/token");

const signup = async (req, res) => {
  try {
    const { name, email, phone, role, district, thana, area, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !role || !district || !thana || !area || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      role,
      district,
      thana,
      area,
      passwordHash
    });

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { signup, login };