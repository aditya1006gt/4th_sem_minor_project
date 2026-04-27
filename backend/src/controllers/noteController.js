const path = require("path");
const Note = require("../models/Note");
const { isValidBranch } = require("../constants/branches");
const { isValidSemester } = require("../constants/semesters");

const uploadNote = async (req, res) => {
  try {
    const { title, branch, semester, subject, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "A note file is required" });
    }

    if (!isValidBranch(branch)) {
      return res.status(400).json({ message: "Invalid branch selected" });
    }

    if (!isValidSemester(semester)) {
      return res.status(400).json({ message: "Invalid semester selected" });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim()
        ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

    const fileUrl = `uploads/notes/${req.file.filename}`;
    const note = await Note.create({
      title,
      filePath: fileUrl,
      fileUrl,
      uploaderId: req.user._id,
      branch,
      semester,
      subject,
      tags: parsedTags
    });

    return res.status(201).json({
      message: "Note uploaded successfully",
      note
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload note", error: error.message });
  }
};

const getNotes = async (req, res) => {
  try {
    const { branch, semester, subject, tag, search } = req.query;
    const filters = {};

    if (branch) {
      if (!isValidBranch(branch)) {
        return res.status(400).json({ message: "Invalid branch selected" });
      }
      filters.branch = branch;
    }

    if (semester) {
      if (!isValidSemester(semester)) {
        return res.status(400).json({ message: "Invalid semester selected" });
      }
      filters.semester = semester;
    }

    if (subject) {
      filters.subject = subject;
    }

    if (tag) {
      filters.tags = tag;
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } }
      ];
    }

    const notes = await Note.find(filters)
      .populate("uploaderId", "name email rollNumber branch year")
      .sort({ createdAt: -1 });

    return res.status(200).json({ notes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notes", error: error.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId).populate(
      "uploaderId",
      "name email rollNumber branch year"
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(200).json({ note });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch note", error: error.message });
  }
};

const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const absolutePath = path.resolve(__dirname, "../../", note.fileUrl || note.filePath);
    return res.download(absolutePath);
  } catch (error) {
    return res.status(500).json({ message: "Failed to download note", error: error.message });
  }
};

module.exports = {
  uploadNote,
  getNotes,
  getNoteById,
  downloadNote
};
