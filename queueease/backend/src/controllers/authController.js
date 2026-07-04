const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    if (role === "staff" && !department) {
      return res.status(400).json({ message: "Staff accounts must be linked to a department" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "staff",
      department: role === "admin" ? null : department,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password").populate("department", "name");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("department", "name");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getStaffAccounts = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "You do not have permission to do this" });
    }

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const staff = await User.find({ role: "staff" }).populate("department", "name").sort({ createdAt: -1 });
    return res.json(staff);
  } catch (err) {
    return res.status(500).json({ message: "Unable to load staff accounts" });
  }
};

module.exports = { register, login, getMe, getStaffAccounts };
