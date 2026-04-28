const cors = require("cors");
const express = require("express");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const noteRoutes = require("./routes/noteRoutes");
const forumRoutes = require("./routes/forumRoutes");
const researchPaperRoutes = require("./routes/researchPaperRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Smart College Platform API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/research-papers", researchPaperRoutes);

app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.message) {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

module.exports = app;
