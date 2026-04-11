const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const {
  listReports,
  updateReport,
  listUsers,
  verifyUser,
  listPets,
  setPetStatus,
} = require("../controllers/adminController");

router.use(protect, requireRole("admin"));

router.get("/reports", listReports);
router.put("/reports/:id", updateReport);

router.get("/users", listUsers);
router.put("/users/:id/verify", verifyUser);

router.get("/pets", listPets);
router.put("/pets/:id/status", setPetStatus);

module.exports = router;

