const mongoose = require("mongoose");

const vaccinationEntrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    scheduledAt: { type: Date, required: true },
    notes: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["scheduled", "done", "missed"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Pet name is required"],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, "Breed is required"],
      trim: true,
    },
    age: {
      type: String,
      required: [true, "Age is required"],
      trim: true,
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
    diet: {
      type: String,
      default: "",
      trim: true,
    },
    pottyTrained: {
      type: Boolean,
      default: false,
    },
    vaccinationStatus: {
      type: String,
      default: "Not Vaccinated",
      trim: true,
    },
    adoptionStatus: {
      type: String,
      enum: ["available", "paused", "reserved", "adopted", "withdrawn"],
      default: "available",
    },
    bio: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    photos: {
      type: [String],
      default: [],
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    temperamentTags: {
      type: [String],
      default: [],
    },
    specialNeeds: {
      type: String,
      default: "",
      trim: true,
    },
    rehomingReason: {
      type: String,
      default: "",
      trim: true,
    },
    preferredAdopterType: {
      type: String,
      default: "",
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    vaccinationSchedule: {
      type: [vaccinationEntrySchema],
      default: [],
    },
    lifestyleRequirements: {
      // Used by FR-11 questionnaire scoring (optional fields)
      homeType: { type: String, enum: ["any", "apartment", "house"], default: "any" },
      activityLevel: { type: String, enum: ["any", "low", "medium", "high"], default: "any" },
      timeAvailable: { type: String, enum: ["any", "low", "medium", "high"], default: "any" },
      goodWithKids: { type: String, enum: ["any", "yes", "no"], default: "any" },
      goodWithOtherPets: { type: String, enum: ["any", "yes", "no"], default: "any" },
      experienceLevel: { type: String, enum: ["any", "firstTimeOk", "experiencedOnly"], default: "any" },
    },
  },
  {
    timestamps: true,
  }
);

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;