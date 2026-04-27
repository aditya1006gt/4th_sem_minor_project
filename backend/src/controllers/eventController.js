const Event = require("../models/Event");

const getEventBranch = (event) => event.branch || event.department || event.createdBy?.branch || event.creatorId?.branch || null;
const isAllBranchEvent = (event) => getEventBranch(event) === "ALL";
const normalizeEventStatus = (status) => {
  const statusMap = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected"
  };

  return statusMap[status] || status;
};

const canProfessorManageEvent = (user, event) =>
  user.role === "professor" && getEventBranch(event) === user.branch;

const canProfessorApproveEvent = (user, event) =>
  user.role === "professor" && (getEventBranch(event) === user.branch || isAllBranchEvent(event));

const canStudentParticipateInEvent = (user, event) => {
  const eventBranch = getEventBranch(event);
  return eventBranch === "ALL" || eventBranch === user.branch;
};

const createEvent = async (req, res) => {
  try {
    const { title, description, clubName, startDate, endDate, venue, targetBranch } = req.body;
    const normalizedTargetBranch = (targetBranch || "").toUpperCase().trim();
    const selectedBranch =
      normalizedTargetBranch === "ALL" ? "ALL" : req.user.branch;

    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const event = await Event.create({
      title,
      description,
      clubName,
      department: selectedBranch,
      branch: selectedBranch,
      creatorId: req.user._id,
      createdBy: req.user._id,
      startDate,
      endDate: endDate || null,
      venue,
      posterPath: req.file ? `uploads/posters/${req.file.filename}` : null,
      status: "Pending"
    });

    return res.status(201).json({
      message: "Event created and submitted for approval",
      event
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create event", error: error.message });
  }
};

const approveEvent = async (req, res) => {
  try {
    const { status = "Approved" } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    const event = req.event;

    event.status = normalizeEventStatus(event.status);

    if (event.status !== "Pending") {
      return res.status(400).json({
        message: "This event has already been reviewed"
      });
    }

    event.branch = getEventBranch(event);
    event.department = event.branch;
    event.status = status;
    await event.save();

    return res.status(200).json({
      message: `Event ${status} successfully`,
      event
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update event status", error: error.message });
  }
};

const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: { $in: ["Approved", "approved"] } })
      .populate("creatorId", "name email")
      .sort({ startDate: 1 });

    const normalizedEvents = events.map((event) => ({
      ...event.toObject(),
      branch: getEventBranch(event),
      status: normalizeEventStatus(event.status),
      isRegistered: event.attendees.some(
        (attendee) => attendee.userId.toString() === req.user._id.toString()
      )
    }));

    const visibleEvents =
      req.user.role === "student"
        ? normalizedEvents.filter((event) => canStudentParticipateInEvent(req.user, event))
        : normalizedEvents;

    return res.status(200).json({ events: visibleEvents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

const getManagedEvents = async (req, res) => {
  try {
    const query = req.user.role === "professor" ? {} : { creatorId: req.user._id };

    const events = await Event.find(query)
      .populate("creatorId", "name email branch")
      .populate("createdBy", "name email branch")
      .sort({ startDate: -1 });

    const filteredEvents =
      req.user.role === "professor"
        ? events.filter((event) => canProfessorApproveEvent(req.user, event))
        : events;

    return res.status(200).json({
      events: filteredEvents.map((event) => ({
        ...event.toObject(),
        branch: getEventBranch(event),
        status: normalizeEventStatus(event.status)
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch managed events", error: error.message });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, email, branch, rollNumber, year } = req.body;
    const event = await Event.findOne({ _id: eventId, status: "Approved" });

    if (!event) {
      return res.status(404).json({ message: "Approved event not found" });
    }

    if (!canStudentParticipateInEvent(req.user, event)) {
      return res.status(403).json({
        message: "You can only register for events in your branch or all-branch events"
      });
    }

    const alreadyRegistered = event.attendees.some(
      (attendee) => attendee.userId.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(409).json({ message: "Form already submitted for this event" });
    }

    const payload = {
      userId: req.user._id,
      name: name?.trim() || req.user.name,
      email: email?.trim()?.toLowerCase() || req.user.email,
      role: req.user.role,
      branch: req.user.branch,
      rollNumber: req.user.role === "professor" ? null : (rollNumber?.trim() || req.user.rollNumber || null),
      year: req.user.role === "professor" ? null : (year?.trim() || req.user.year || null)
    };

    event.attendees.push(payload);
    await event.save();

    return res.status(201).json({
      message: "Event form submitted successfully",
      registration: payload
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit event form", error: error.message });
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate(
      "attendees.userId",
      "name email role rollNumber branch year"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isCreator = event.creatorId?.toString() === req.user._id.toString();
    const isDepartmentProfessor = canProfessorManageEvent(req.user, event);

    if (!isCreator && !isDepartmentProfessor) {
      return res.status(403).json({ message: "You are not allowed to view submissions for this event" });
    }

    return res.status(200).json({
      eventId: event._id,
      title: event.title,
      attendees: event.attendees
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch attendees", error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate("creatorId", "branch").populate("createdBy", "branch");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const canDelete =
      canProfessorManageEvent(req.user, event) ||
      event.creatorId._id.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: "You are not allowed to delete this event" });
    }

    await event.deleteOne();

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

module.exports = {
  createEvent,
  approveEvent,
  getApprovedEvents,
  getManagedEvents,
  registerForEvent,
  getEventAttendees,
  deleteEvent
};
