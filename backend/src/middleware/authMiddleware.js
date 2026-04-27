const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token is missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access", error: error.message });
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied for role: ${req.user.role}`
    });
  }

  next();
};

const requireBranchAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  if (req.user.role !== "club_admin") {
    return res.status(403).json({ message: "Only branch admins can create events" });
  }

  next();
};

const requireSameBranchProfessorForEvent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (req.user.role !== "professor") {
      return res.status(403).json({ message: "Only professors can approve or reject events" });
    }

    const event = await Event.findById(req.params.eventId).populate("createdBy", "branch");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventBranch = event.branch || event.department || event.createdBy?.branch;
    const canApproveAllBranchEvent = eventBranch === "ALL";

    if (!canApproveAllBranchEvent && eventBranch !== req.user.branch) {
      return res.status(403).json({
        message: "Professors can only approve or reject events from their own branch"
      });
    }

    req.event = event;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to validate event branch", error: error.message });
  }
};

module.exports = {
  protect,
  authorize,
  requireBranchAdmin,
  requireSameBranchProfessorForEvent
};
