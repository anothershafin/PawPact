const Review = require("../models/Review");
const ObservationContract = require("../models/ObservationContract");

const createReview = async (req, res) => {
  try {
    const { contractId, toUserId, rating, text } = req.body;
    if (!contractId || !toUserId || !rating) {
      return res.status(400).json({ message: "contractId, toUserId, rating are required" });
    }

    const contract = await ObservationContract.findById(contractId);
    if (!contract) return res.status(404).json({ message: "Contract not found" });

    const isParticipant =
      contract.adopter.toString() === req.user._id.toString() ||
      contract.petParent.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: "Forbidden" });
    if (contract.status !== "closed_adopted") {
      return res.status(400).json({ message: "Reviews are available after adoption is finalized" });
    }

    const review = await Review.create({
      contract: contract._id,
      fromUser: req.user._id,
      toUser: toUserId,
      rating,
      text: text || "",
    });
    res.status(201).json(review);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).json({ message: "You already reviewed this contract" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ toUser: req.params.userId })
      .populate("fromUser", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviewsForUser };

