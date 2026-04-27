const mongoose = require("mongoose");
const { BRANCHES } = require("../constants/branches");
const { SEMESTERS } = require("../constants/semesters");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    branch: {
      type: String,
      required: true,
      enum: BRANCHES,
      trim: true
    },
    semester: {
      type: String,
      required: true,
      enum: SEMESTERS,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

noteSchema.pre("validate", function normalizeFileFields(next) {
  if (!this.fileUrl && this.filePath) {
    this.fileUrl = this.filePath;
  }

  next();
});

module.exports = mongoose.model("Note", noteSchema);
