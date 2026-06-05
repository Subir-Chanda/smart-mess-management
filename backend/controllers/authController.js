const User = require("../models/User");
const Mess = require("../models/Mess");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================
// REGISTER
// Role is NOT set here anymore.
// Role is determined in PostSignup:
//   - Create mess → backend sets admin
//   - Join mess   → user picks admin/member, backend saves it
// ======================================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "member", // neutral default — will be updated in PostSignup
      approvalStatus: "pending",
      isActive: true,
      messId: null,
      setupStatus: "pending_mess",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        setupStatus: user.setupStatus,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ======================================
// LOGIN
// ======================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("messId", "name");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    // If user hasn't chosen a mess yet → send them to post-signup
    if (user.setupStatus === "pending_mess") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid Credentials",
        });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.status(200).json({
        success: true,
        token,
        redirectTo: "post-signup",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          setupStatus: user.setupStatus,
        },
      });
    }

    // If user sent a join request but not approved yet
    if (user.setupStatus === "pending_approval") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid Credentials",
        });
      }
      return res.status(403).json({
        success: false,
        message: `Your request to join ${user.messId?.name || "the mess"} is pending admin approval.`,
      });
    }

    // Normal approval check
    if (user.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Waiting For Admin Approval",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        messId: user.messId?._id || user.messId,
        messName: user.messId?.name || null,
        setupStatus: user.setupStatus,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
