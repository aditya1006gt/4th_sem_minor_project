const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    qrCodeUrl: {
      type: String,
      required: true
    },
    isScanned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

ticketSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Ticket", ticketSchema);
