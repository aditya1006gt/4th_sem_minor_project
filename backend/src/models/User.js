const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { BRANCHES } = require("../constants/branches");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["student", "club_admin", "professor"],
      default: "student"
    },
    rollNumber: {
      type: String,
      required: function requireRollNumber() {
        return this.role !== "professor";
      },
      default: null,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      enum: BRANCHES,
      trim: true
    },
    year: {
      type: String,
      required: function requireYear() {
        return this.role !== "professor";
      },
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
