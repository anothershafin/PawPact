
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

module.exports = { updateShortlist, updateLifestyleAnswers, createApplication, updateApplicationStatus, getApplications, removeFromShortlist };