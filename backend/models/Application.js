const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    petParent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["submitted", "under review", "accepted", "rejected", "withdrawn"],
      default: "submitted"  
    },
    observationStartDate: { 
    type: Date 
  },
  observationTasks: [
    {
      taskDescription: { type: String, required: true },
      dueDate: { type: Date, required: true },
      adopterReply: { type: String, default: "" },
      isCompleted: { type: Boolean, default: false },
      photoUrl: { type: String, default: "" } // Satisfies the "optional photos" requirement
    }
  ],
    
    message: { type: String, default: "" }
  },
  
  { timestamps: true }
  
);
applicationSchema.index({ pet: 1, adopter: 1 }, { unique: true });
module.exports = mongoose.model("Application", applicationSchema);