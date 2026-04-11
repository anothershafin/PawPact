const Application = require("../models/Application");
const Pet = require("../models/Pet");
const ObservationContract = require("../models/ObservationContract");

const createApplication = async (req, res) => {
  try {
    const { petId, message } = req.body;
    if (!petId) return res.status(400).json({ message: "petId is required" });

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.adoptionStatus !== "available") {
      return res.status(400).json({ message: "Pet is not available for adoption" });
    }

    if (pet.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot apply to your own pet" });
    }

    const application = await Application.create({
      pet: pet._id,
      adopter: req.user._id,
      petParent: pet.owner,
      message: message || "",
      status: "submitted",
    });

    res.status(201).json(application);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: "You already applied for this pet" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ adopter: req.user._id })
      .populate("pet", "name breed age district upazilla profilePhoto adoptionStatus")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (app.adopter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (app.status === "accepted") {
      return res.status(400).json({ message: "Cannot withdraw an accepted application" });
    }
    app.status = "withdrawn";
    await app.save();
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApplicationsForMyPets = async (req, res) => {
  try {
    const apps = await Application.find({ petParent: req.user._id })
      .populate("pet", "name breed age district upazilla profilePhoto adoptionStatus")
      .populate("adopter", "name email phone district upazilla isVerified")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["submitted", "under_review", "accepted", "rejected", "withdrawn"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (app.petParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (app.status === "withdrawn") {
      return res.status(400).json({ message: "Cannot change a withdrawn application" });
    }

    // Pet parent can set: submitted/under_review/accepted/rejected
    if (status === "withdrawn") {
      return res.status(403).json({ message: "Only adopter can withdraw" });
    }

    app.status = status;
    await app.save();

    // If accepted, reserve the pet (full contract comes in FR-14+)
    if (status === "accepted") {
      const pet = await Pet.findById(app.pet);
      if (pet) {
        pet.adoptionStatus = "reserved";
        await pet.save();
      }

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      await ObservationContract.create({
        application: app._id,
        pet: app.pet,
        adopter: app.adopter,
        petParent: app.petParent,
        startDate,
        endDate,
      });
    }

    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  withdrawApplication,
  getApplicationsForMyPets,
  updateApplicationStatus,
};

