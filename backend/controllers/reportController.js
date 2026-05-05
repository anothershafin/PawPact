const mongoose = require("mongoose");
const Report = require("../models/Report");

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { reportType, reportedUser, reportedPet, reason, details, evidence } = req.body;

    // 1. Basic Validation
    if (!reportType || !reason) {
      return res.status(400).json({ message: "Report type and reason are required" });
    }

    // 2. Logic Validation (User vs Pet)
    if (reportType === "user" && !reportedUser) {
      return res.status(400).json({ message: "Reported user is required" });
    }

    if (reportType === "pet" && !reportedPet) {
      return res.status(400).json({ message: "Reported pet is required" });
    }

    // 3. ID Validity Validation (Prevents Mongoose CastErrors)
    if (reportType === "user" && !mongoose.Types.ObjectId.isValid(reportedUser)) {
      return res.status(400).json({ message: "Please provide a valid reported user ID" });
    }

    if (reportType === "pet" && !mongoose.Types.ObjectId.isValid(reportedPet)) {
      return res.status(400).json({ message: "Please provide a valid reported pet ID" });
    }

    // 4. Creation
    const report = await Report.create({
      reportedBy: req.user._id,
      reportType,
      reportedUser: reportType === "user" ? reportedUser : null,
      reportedPet: reportType === "pet" ? reportedPet : null,
      reason,
      details,
      evidence,
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my reports
// @route   GET /api/reports/my
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id })
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      // Added pet population in case you need it in the UI
      .populate("reportedPet", "name breed") 
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      .populate("reportedPet", "name breed")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update report status (admin only)
// @route   PUT /api/reports/:id
// @access  Private/Admin
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = status;
    const updated = await report.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a report (admin only)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    await report.deleteOne();
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
  deleteReport,
};