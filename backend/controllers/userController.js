const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper: Generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || String(secret).trim() === "") {
    throw new Error("JWT_SECRET is not set in backend .env");
  }
  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, district, upazilla } = req.body;

    const emailNorm = email != null ? String(email).trim().toLowerCase() : "";

    // Check if user already exists
    const userExists = await User.findOne({ email: emailNorm });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create user in database
    const user = await User.create({
      name,
      email: emailNorm,
      phone,
      password,
      role,
      district,
      upazilla,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        upazilla: user.upazilla,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailNorm = String(email).trim().toLowerCase();

    // Find user by email (stored lowercase in DB)
    const user = await User.findOne({ email: emailNorm });

    // Check if user exists AND password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        upazilla: user.upazilla,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update logged in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.district = req.body.district || user.district;
      user.upazilla = req.body.upazilla || user.upazilla;
      user.profilePhoto = req.body.profilePhoto !== undefined ? req.body.profilePhoto : user.profilePhoto;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        district: updatedUser.district,
        upazilla: updatedUser.upazilla,
        isVerified: updatedUser.isVerified,
        profilePhoto: updatedUser.profilePhoto,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request OTP (demo verification)
// @route   POST /api/users/verification/request-otp
// @access  Private
const requestOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.setOtp(otp, 10);
    await user.save();

    // NOTE: For a class project/demo we return OTP in response.
    // In production, this would be delivered via SMS/email.
    res.json({ otp, expiresInMinutes: 10 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit OTP
// @route   POST /api/users/verification/submit-otp
// @access  Private
const submitOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "otp is required" });

    const user = await User.findById(req.user._id);
    const ok = user.verifyOtp(otp);
    if (!ok) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.verification.verifiedAt = new Date();
    user.verification.otpHash = "";
    user.verification.otpExpiresAt = null;
    await user.save();

    res.json({ isVerified: true, verifiedAt: user.verification.verifiedAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  requestOtp,
  submitOtp,
};
