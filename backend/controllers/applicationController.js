const Application = require("../models/Application");
const User = require("../models/User");

// Timer configuration: 1 minute for demo (1209600000ms = 14 days for production)
const OBSERVATION_PERIOD = 60000; // 1 minute for demo

// Store active timers to prevent multiple timers on same application
const activeTimers = {};

// @desc    Start observation period (called when application status changes to "under review")
// @route   POST /api/applications/:id/start-observation
// @access  Private
const startObservation = async (req, res) => {
  try {
    console.log("=== START OBSERVATION REQUEST ===");
    console.log("Application ID:", req.params.id);
    
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      console.log("Application not found for start-observation");
      return res.status(404).json({ message: "Application not found" });
    }

    // Only pet parent can start observation
    if (application.petParent.toString() !== req.user._id.toString()) {
      console.log("User not authorized - not pet parent");
      return res.status(403).json({ message: "Not authorized" });
    }

    // Set status to under review and start observation
    application.status = "under review";
    application.observationStartDate = new Date();
    await application.save();

    console.log("Observation started for application:", application._id);

    // Set up auto-finalization timer (1 minute for demo)
    if (!activeTimers[application._id]) {
      console.log("Setting up auto-finalization timer for:", application._id);
      activeTimers[application._id] = setTimeout(async () => {
        try {
          const app = await Application.findById(application._id);
          if (app && app.status === "under review" && !app.returnRequested) {
            app.status = "accepted";
            await app.save();
            console.log(`Application ${application._id} auto-finalized after observation period`);
          }
          delete activeTimers[application._id];
        } catch (error) {
          console.error("Auto-finalization error:", error);
        }
      }, OBSERVATION_PERIOD);
    }

    res.json({ 
      message: "Observation period started", 
      application,
      observationEndsAt: new Date(Date.now() + OBSERVATION_PERIOD)
    });
  } catch (error) {
    console.error("Error in startObservation:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send check-in question
// @route   POST /api/applications/:id/check-in-questions
// @access  Private
const sendCheckInQuestion = async (req, res) => {
  try {
    const { question, dueDate } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only pet parent can send check-in questions
    if (application.petParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== "under review") {
      return res.status(400).json({ message: "Can only send questions during observation period" });
    }

    application.checkInQuestions.push({
      question,
      dueDate: new Date(dueDate),
      askedBy: req.user._id
    });

    await application.save();

    res.json({ 
      message: "Check-in question added", 
      application 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request return (cancel adoption during observation)
// @route   POST /api/applications/:id/request-return
// @access  Private
const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only adopter can request return
    if (application.adopter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== "under review") {
      return res.status(400).json({ message: "Can only request return during observation period" });
    }

    // Mark return as requested and close case
    application.returnRequested = true;
    application.returnReason = reason || "";
    application.status = "withdrawn";
    
    // Clear timer if exists
    if (activeTimers[application._id]) {
      clearTimeout(activeTimers[application._id]);
      delete activeTimers[application._id];
    }

    await application.save();

    res.json({ 
      message: "Return request processed - adoption case closed", 
      application 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send chat message during observation
// @route   POST /api/applications/:id/chat
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Both adopter and pet parent can chat
    const isAdopter = application.adopter.toString() === req.user._id.toString();
    const isPetParent = application.petParent.toString() === req.user._id.toString();

    if (!isAdopter && !isPetParent) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== "under review") {
      return res.status(400).json({ message: "Can only chat during observation period" });
    }

    application.chatMessages.push({
      sender: req.user._id,
      message
    });

    await application.save();

    res.json({ 
      message: "Message sent", 
      application 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get application details with chat and check-in questions
// @route   GET /api/applications/:id
// @access  Private
const getApplication = async (req, res) => {
  try {
    console.log("=== GET APPLICATION REQUEST ===");
    console.log("Application ID:", req.params.id);
    console.log("User ID:", req.user._id);
    
    const application = await Application.findById(req.params.id);

    if (!application) {
      console.log("Application not found with ID:", req.params.id);
      return res.status(404).json({ message: "Application not found" });
    }

    console.log("Application found, populating...");
    
    // Populate manually with error handling
    await application.populate("adopter", "name email");
    await application.populate("pet", "name");
    await application.populate("petParent", "name email");
    
    if (application.chatMessages && application.chatMessages.length > 0) {
      await application.populate("chatMessages.sender", "name");
    }
    if (application.checkInQuestions && application.checkInQuestions.length > 0) {
      await application.populate("checkInQuestions.askedBy", "name");
    }

    // Calculate remaining observation time
    let remainingTime = null;
    if (application.status === "under review" && application.observationStartDate) {
      const elapsed = Date.now() - new Date(application.observationStartDate).getTime();
      remainingTime = Math.max(0, OBSERVATION_PERIOD - elapsed);
    }

    console.log("Successfully fetched application");
    res.json({ 
      ...application.toObject(), 
      remainingObservationTime: remainingTime 
    });
  } catch (error) {
    console.error("Error in getApplication:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startObservation,
  sendCheckInQuestion,
  requestReturn,
  sendChatMessage,
  getApplication
};
