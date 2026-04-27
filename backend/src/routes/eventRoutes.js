const express = require("express");
const {
  createEvent,
  approveEvent,
  getApprovedEvents,
  getManagedEvents,
  registerForEvent,
  getEventAttendees,
  deleteEvent
} = require("../controllers/eventController");
const {
  protect,
  authorize,
  requireBranchAdmin,
  requireSameBranchProfessorForEvent
} = require("../middleware/authMiddleware");
const { uploadPoster } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", protect, getApprovedEvents);
router.get(
  "/manage",
  protect,
  authorize("club_admin", "professor"),
  getManagedEvents
);

router.post(
  "/",
  protect,
  requireBranchAdmin,
  uploadPoster,
  createEvent
);

router.patch(
  "/:eventId/approval",
  protect,
  authorize("professor"),
  requireSameBranchProfessorForEvent,
  approveEvent
);

router.post(
  "/:eventId/register",
  protect,
  authorize("student"),
  registerForEvent
);

router.get(
  "/:eventId/attendees",
  protect,
  authorize("club_admin", "professor"),
  getEventAttendees
);

router.delete(
  "/:eventId",
  protect,
  authorize("club_admin", "professor"),
  deleteEvent
);

module.exports = router;
