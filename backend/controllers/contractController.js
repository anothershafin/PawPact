const ObservationContract = require("../models/ObservationContract");
const ObservationUpdate = require("../models/ObservationUpdate");
const CheckInQuestion = require("../models/CheckInQuestion");
const Pet = require("../models/Pet");

const isParticipant = (contract, userId) =>
  contract.adopter.toString() === userId.toString() || contract.petParent.toString() === userId.toString();

const listMyContracts = async (req, res) => {
  try {
    const filter =
      req.user.role === "adopter" ? { adopter: req.user._id } : { petParent: req.user._id };
    const contracts = await ObservationContract.find(filter)
      .populate("pet", "name breed age district upazilla profilePhoto adoptionStatus")
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContractById = async (req, res) => {
  try {
    const contract = await ObservationContract.findById(req.params.id).populate(
      "pet",
      "name breed age district upazilla profilePhoto adoptionStatus"
    );
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (!isParticipant(contract, req.user._id)) return res.status(403).json({ message: "Forbidden" });

    const [updates, checkins] = await Promise.all([
      ObservationUpdate.find({ contract: contract._id }).sort({ createdAt: -1 }),
      CheckInQuestion.find({ contract: contract._id }).sort({ dueAt: 1 }),
    ]);

    res.json({ contract, updates, checkins });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postUpdate = async (req, res) => {
  try {
    const { notes, photos } = req.body;
    if (!notes || !notes.trim()) return res.status(400).json({ message: "notes is required" });

    const contract = await ObservationContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.adopter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (contract.status !== "active") {
      return res.status(400).json({ message: "Contract is not active" });
    }

    const update = await ObservationUpdate.create({
      contract: contract._id,
      author: req.user._id,
      notes: notes.trim(),
      photos: Array.isArray(photos) ? photos : [],
    });
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCheckIn = async (req, res) => {
  try {
    const { question, dueAt } = req.body;
    if (!question || !dueAt) return res.status(400).json({ message: "question and dueAt are required" });

    const contract = await ObservationContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.petParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (contract.status !== "active") {
      return res.status(400).json({ message: "Contract is not active" });
    }

    const checkin = await CheckInQuestion.create({
      contract: contract._id,
      createdBy: req.user._id,
      question: question.trim(),
      dueAt: new Date(dueAt),
    });
    res.status(201).json(checkin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const answerCheckIn = async (req, res) => {
  try {
    const { answerText, answerPhotos } = req.body;
    if (!answerText || !answerText.trim()) return res.status(400).json({ message: "answerText is required" });

    const contract = await ObservationContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.adopter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const checkin = await CheckInQuestion.findById(req.params.checkinId);
    if (!checkin) return res.status(404).json({ message: "Check-in not found" });
    if (checkin.contract.toString() !== contract._id.toString()) {
      return res.status(400).json({ message: "Check-in does not belong to this contract" });
    }

    checkin.answerText = answerText.trim();
    checkin.answerPhotos = Array.isArray(answerPhotos) ? answerPhotos : [];
    checkin.answeredAt = new Date();
    await checkin.save();
    res.json(checkin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestReturn = async (req, res) => {
  try {
    const contract = await ObservationContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.petParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (contract.status !== "active") {
      return res.status(400).json({ message: "Contract is not active" });
    }

    contract.status = "return_requested";
    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmCompletion = async (req, res) => {
  try {
    const contract = await ObservationContract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (!isParticipant(contract, req.user._id)) return res.status(403).json({ message: "Forbidden" });

    if (req.user.role === "adopter") contract.adopterConfirmedAt = new Date();
    if (req.user.role === "petparent") contract.petParentConfirmedAt = new Date();

    // If both confirm and contract is active, close as adopted
    if (contract.adopterConfirmedAt && contract.petParentConfirmedAt && contract.status === "active") {
      contract.status = "closed_adopted";
      const pet = await Pet.findById(contract.pet);
      if (pet) {
        pet.adoptionStatus = "adopted";
        await pet.save();
      }
    }
    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listMyContracts,
  getContractById,
  postUpdate,
  createCheckIn,
  answerCheckIn,
  requestReturn,
  confirmCompletion,
};

