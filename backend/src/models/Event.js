const mongoose = require("mongoose");
const { BRANCHES } = require("../constants/branches");

const EVENT_STATUSES = ["Pending", "Approved", "Rejected"];
const EVENT_BRANCHES = [...BRANCHES, "ALL"];

const attendeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ["student", "club_admin", "professor"],
      required: true
    },
    branch: {
      type: String,
      required: true,
      enum: BRANCHES,
      trim: true
    },
    rollNumber: {
      type: String,
      default: null,
      trim: true
    },
    year: {
      type: String,
      default: null,
      trim: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    clubName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      enum: EVENT_BRANCHES,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      enum: EVENT_BRANCHES,
      trim: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: null
    },
    venue: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: EVENT_STATUSES,
      default: "Pending"
    },
    posterPath: {
      type: String,
      default: null,
      trim: true
    },
    attendees: {
      type: [attendeeSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

eventSchema.pre("validate", function normalizeLegacyFields(next) {
  if (!this.branch && this.department) {
    this.branch = this.department;
  }

  if (!this.department && this.branch) {
    this.department = this.branch;
  }

  if (!this.createdBy && this.creatorId) {
    this.createdBy = this.creatorId;
  }

  const statusMap = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected"
  };

  if (statusMap[this.status]) {
    this.status = statusMap[this.status];
  }

  next();
});

module.exports = mongoose.model("Event", eventSchema);
