
const User = require("../models/User");
const Application = require("../models/Application");


const updateShortlist = async (req, res) => {
  try {
    const { petId, label } = req.body;
    const user = await User.findById(req.user._id);
    
    const existingIndex = user.shortlist.findIndex(item => item.pet.toString() === petId);
    if (existingIndex >= 0) {
      user.shortlist[existingIndex].label = label; // Update label
    } else {
      user.shortlist.push({ pet: petId, label }); // Add new
    }
    await user.save();
    res.json(user.shortlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateLifestyleAnswers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.lifestyleAnswers = req.body.answers; // Expecting an object of key/values
    await user.save();
    res.json(user.lifestyleAnswers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createApplication = async (req, res) => {
  try {
    const { petId, petParentId, message } = req.body;
    const application = await Application.create({
      adopter: req.user._id,
      pet: petId,
      petParent: petParentId,
      message
    });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (application.petParent.toString() !== req.user._id.toString() && req.user.role !== 'adopter') {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    application.status = status;
    const updated = await application.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    let applications;
    if (req.user.role === "adopter") {
      // Adopters see apps they sent
      applications = await Application.find({ adopter: req.user._id }).populate("pet", "name breed profilePhoto");
    } else {
      // Pet Parents see apps received for their pets
      applications = await Application.find({ petParent: req.user._id })
        .populate("pet", "name breed")
        .populate("adopter", "name email phone district");
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const removeFromShortlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Filter out the pet that matches the ID sent in the URL
    user.shortlist = user.shortlist.filter(item => item.pet.toString() !== req.params.petId);
    await user.save();
    res.json(user.shortlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single application by ID (for agreement page)
// @route   GET /api/features/applications/:id
// @access  Private (adopter or pet parent only)
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("pet", "name breed profilePhoto")
      .populate("adopter", "name email phone district")
      .populate("petParent", "name email phone district");

    if (!application) return res.status(404).json({ message: "Application not found" });

    const isAdopter = application.adopter._id.toString() === req.user._id.toString();
    const isParent = application.petParent._id.toString() === req.user._id.toString();
    if (!isAdopter && !isParent) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm the adoption agreement (adopter or pet parent)
// @route   PUT /api/features/applications/:id/agreement
// @access  Private
const confirmAgreement = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.status !== "accepted") {
      return res.status(400).json({ message: "Agreement is only available for accepted applications" });
    }

    const isAdopter = application.adopter.toString() === req.user._id.toString();
    const isParent = application.petParent.toString() === req.user._id.toString();
    if (!isAdopter && !isParent) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!application.agreement) {
      application.agreement = { adopterConfirmed: false, parentConfirmed: false };
    }

    if (isAdopter) {
      application.agreement.adopterConfirmed = true;
      application.agreement.adopterConfirmedAt = new Date();
    }
    if (isParent) {
      application.agreement.parentConfirmed = true;
      application.agreement.parentConfirmedAt = new Date();
    }

    const updated = await application.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateShortlist, updateLifestyleAnswers, createApplication, updateApplicationStatus, getApplications, removeFromShortlist, getApplicationById, confirmAgreement };