const Application = require('../models/Application');

const createApplication = async (req, res) => {
  try {
    const { petId, message, petParent } = req.body;
    
    const existingApp = await Application.findOne({
      pet: petId,
      adopter: req.user._id
    });

    if (existingApp) {
      return res.status(400).json({ 
        message: "You have already applied to adopt this pet." 
      });
    }

    const newApplication = new Application({
      pet: petId,
      adopter: req.user._id,
      petParent: petParent,
      message: message || ""
    });

    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "You have already applied to adopt this pet." 
      });
    }
    res.status(400).json({ message: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const applications = await Application.find({
      $or: [
        { adopter: userId },
        { petParent: userId }
      ]
    })
      .populate('pet')
      .populate('adopter')
      .populate('petParent')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateAppStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.petParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    application.status = status;
    
    // ✅ If accepting, set observation period (30 days default)
    if (status === 'accepted' && !application.observationStartDate) {
      application.observationStartDate = new Date();
    }
    
    await application.save();

    const updatedApp = await Application.findById(id)
      .populate('pet')
      .populate('adopter')
      .populate('petParent');

    res.json(updatedApp);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW - Add observation updates
const addObservationUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.petParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: "Can only add updates to accepted applications" });
    }

    application.observationUpdates.push({
      title,
      description,
      dueDate: new Date(dueDate)
    });

    await application.save();

    const updatedApp = await Application.findById(id)
      .populate('pet')
      .populate('adopter')
      .populate('petParent');

    res.json(updatedApp);
  } catch (error) {
    console.error('Error adding observation update:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW - Adopter submits response to observation update
const submitObservationResponse = async (req, res) => {
  try {
    const { id, updateId } = req.params;
    const { note, photos } = req.body;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.adopter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const update = application.observationUpdates.id(updateId);
    
    if (!update) {
      return res.status(404).json({ message: "Update not found" });
    }

    update.adopterResponse = {
      note,
      photos: photos || [],
      submittedAt: new Date()
    };
    update.status = 'completed';

    await application.save();

    const updatedApp = await Application.findById(id)
      .populate('pet')
      .populate('adopter')
      .populate('petParent');

    res.json(updatedApp);
  } catch (error) {
    console.error('Error submitting observation response:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW - Delete observation update
const deleteObservationUpdate = async (req, res) => {
  try {
    const { id, updateId } = req.params;

    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.petParent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.observationUpdates.pull(updateId);
    await application.save();

    const updatedApp = await Application.findById(id)
      .populate('pet')
      .populate('adopter')
      .populate('petParent');

    res.json(updatedApp);
  } catch (error) {
    console.error('Error deleting observation update:', error);
    res.status(500).json({ message: error.message });
  }
};
// 1. Parent adds a task
const addTask = async (req, res) => {
  try {
    const { taskDescription, dueDate } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ message: "Application not found" });

    // Set the start date if this is the very first task added
    if (!application.observationStartDate) {
      application.observationStartDate = new Date();
    }

    application.observationTasks.push({ taskDescription, dueDate });
    await application.save();

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Adopter replies to a task
const replyToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { adopterReply, photoUrl } = req.body;
    
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Find the specific task
    const task = application.observationTasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Update the task fields
    task.adopterReply = adopterReply;
    if (photoUrl) task.photoUrl = photoUrl;
    task.isCompleted = true; // Mark as done

    await application.save();
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { 
  createApplication, 
  getApplications, 
  updateAppStatus,
  addObservationUpdate,
  submitObservationResponse,
  deleteObservationUpdate,
  addTask,
  replyToTask
};