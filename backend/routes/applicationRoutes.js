const express = require('express');
const router = express.Router();
const { 
  createApplication, 
  getApplications, 
  updateAppStatus,
  addObservationUpdate,
  addTask,
  replyToTask,
  submitObservationResponse,
  deleteObservationUpdate
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createApplication);
router.get('/', protect, getApplications);
router.put('/:id', protect, updateAppStatus);
router.post('/:id/tasks', protect, addTask);
router.put('/:id/tasks/:taskId', protect, replyToTask);
// NEW - Observation update routes
router.post('/:id/observations', protect, addObservationUpdate);
router.put('/:id/observations/:updateId', protect, submitObservationResponse);
router.delete('/:id/observations/:updateId', protect, deleteObservationUpdate);

module.exports = router;