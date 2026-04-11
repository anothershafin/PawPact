const mongoose = require("mongoose");

const checkInQuestionSchema = new mongoose.Schema(
  {
    contract: { type: mongoose.Schema.Types.ObjectId, ref: "ObservationContract", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true, trim: true },
    dueAt: { type: Date, required: true },
    answerText: { type: String, default: "", trim: true },
    answerPhotos: { type: [String], default: [] },
    answeredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const CheckInQuestion = mongoose.model("CheckInQuestion", checkInQuestionSchema);
module.exports = CheckInQuestion;

