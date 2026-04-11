const mongoose = require("mongoose");
const User = require("../models/User");
const Pet = require("../models/Pet");

const getShortlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("shortlistLabels");
    res.json(user.shortlistLabels || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLabel = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "title is required" });
    const user = await User.findById(req.user._id);
    user.shortlistLabels.push({ title: title.trim(), petIds: [] });
    await user.save();
    res.status(201).json(user.shortlistLabels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const renameLabel = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "title is required" });
    const user = await User.findById(req.user._id);
    const label = user.shortlistLabels.id(req.params.labelId);
    if (!label) return res.status(404).json({ message: "Label not found" });
    label.title = title.trim();
    await user.save();
    res.json(user.shortlistLabels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLabel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const label = user.shortlistLabels.id(req.params.labelId);
    if (!label) return res.status(404).json({ message: "Label not found" });
    label.deleteOne();
    await user.save();
    res.json(user.shortlistLabels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPetToLabel = async (req, res) => {
  try {
    const { petId } = req.body;
    if (!petId) return res.status(400).json({ message: "petId is required" });
    if (!mongoose.isValidObjectId(petId)) return res.status(400).json({ message: "Invalid petId" });

    const pet = await Pet.findById(petId).select("_id");
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const user = await User.findById(req.user._id);
    const label = user.shortlistLabels.id(req.params.labelId);
    if (!label) return res.status(404).json({ message: "Label not found" });

    const already = label.petIds.some((id) => id.toString() === petId.toString());
    if (!already) label.petIds.push(pet._id);
    await user.save();
    res.json(label);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removePetFromLabel = async (req, res) => {
  try {
    const { labelId, petId } = req.params;
    const user = await User.findById(req.user._id);
    const label = user.shortlistLabels.id(labelId);
    if (!label) return res.status(404).json({ message: "Label not found" });

    label.petIds = label.petIds.filter((id) => id.toString() !== petId.toString());
    await user.save();
    res.json(label);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getShortlist,
  createLabel,
  renameLabel,
  deleteLabel,
  addPetToLabel,
  removePetFromLabel,
};

