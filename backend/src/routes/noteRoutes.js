const express = require("express");
const {
  uploadNote,
  getNotes,
  getNoteById,
  downloadNote
} = require("../controllers/noteController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadNote: uploadNoteFile } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", protect, getNotes);
router.get("/:noteId", protect, getNoteById);
router.get("/:noteId/download", protect, downloadNote);

router.post(
  "/",
  protect,
  authorize("student", "club_admin", "professor"),
  uploadNoteFile,
  uploadNote
);

module.exports = router;
