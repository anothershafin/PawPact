const Report = require("../models/Report");

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, evidencePhotos } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: "targetType, targetId, reason are required" });
    }
    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      evidencePhotos: Array.isArray(evidencePhotos) ? evidencePhotos : [],
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, getMyReports };

