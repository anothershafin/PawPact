const User = require("../models/User");
const Pet = require("../models/Pet");
const Report = require("../models/Report");

const listReports = async (_req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reporter", "name email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listUsers = async (_req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isVerified = true;
    user.verification = user.verification || {};
    user.verification.verifiedAt = new Date();
    await user.save();
    res.json({ _id: user._id, isVerified: user.isVerified, verifiedAt: user.verification.verifiedAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listPets = async (_req, res) => {
  try {
    const pets = await Pet.find({}).sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setPetStatus = async (req, res) => {
  try {
    const { adoptionStatus } = req.body;
    const allowed = ["available", "paused", "reserved", "adopted", "withdrawn"];
    if (!allowed.includes(adoptionStatus)) {
      return res.status(400).json({ message: "Invalid adoptionStatus" });
    }
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    pet.adoptionStatus = adoptionStatus;
    await pet.save();
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { listReports, updateReport, listUsers, verifyUser, listPets, setPetStatus };

