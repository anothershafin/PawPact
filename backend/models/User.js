const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const shortlistLabelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    petIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Pet", default: [] },
  },
  { timestamps: true }
);

const lifestyleAnswerSchema = new mongoose.Schema(
  {
    homeType: { type: String, enum: ["apartment", "house"], required: true },
    activityLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    timeAvailable: { type: String, enum: ["low", "medium", "high"], required: true },
    goodWithKids: { type: String, enum: ["yes", "no"], required: true },
    goodWithOtherPets: { type: String, enum: ["yes", "no"], required: true },
    experienceLevel: { type: String, enum: ["firstTime", "experienced"], required: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["adopter", "petparent", "admin"],
      default: "adopter",
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    upazilla: {
      type: String,
      required: [true, "Upazilla is required"],
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {  //fr_02
      type: String,
      default: "",
    },
    otpExpires: {  //fr_02
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Added 'return' here
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
