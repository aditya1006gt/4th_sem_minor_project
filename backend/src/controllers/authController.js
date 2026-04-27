const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { isValidBranch } = require("../constants/branches");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, branch, year } = req.body;
    const selectedRole = role || "student";

    if (!name || !email || !password || !branch) {
      return res.status(400).json({
        message: "Name, email, password, and branch are required"
      });
    }

    if (!isValidBranch(branch)) {
      return res.status(400).json({ message: "Invalid branch selected" });
    }

    if (selectedRole !== "professor" && (!rollNumber || !year)) {
      return res.status(400).json({
        message: "Roll number and year are required for students and club admins"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: selectedRole,
      rollNumber: selectedRole === "professor" ? null : rollNumber,
      branch,
      year: selectedRole === "professor" ? null : year
    });

    return res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        branch: user.branch,
        year: user.year
      }
    });
  } catch (error) {
    console.error("Register user error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    return res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        branch: user.branch,
        year: user.year
      }
    });
  } catch (error) {
    console.error("Login user error:", error);
    return res.status(500).json({ message: "Failed to login user", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser
};
