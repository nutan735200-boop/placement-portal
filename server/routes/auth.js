const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const crypto   = require("crypto");
const nodemailer = require("nodemailer");
const User     = require("../models/user");
const Student  = require("../models/student");
const Recruiter= require("../models/recruiter");
const router   = express.Router();

const mailer = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } })
  : null;

// ── Register ───────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, password, role, college, company } = req.body;
    const emailAddress = String(req.body.email || "").trim().toLowerCase();

    if (!name || !emailAddress || !password || !role)
      return res.status(400).json({ message: "All fields required" });
    if (String(password).length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: emailAddress });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ name: String(name).trim(), email: emailAddress, password: hashed, role });

    try {
      if (role === "student") {
        await Student.create({ userId: user._id, name: user.name, email: emailAddress, college: college || "" });
      } else if (role === "recruiter") {
        await Recruiter.create({ userId: user._id, name: user.name, email: emailAddress, company: company || "" });
      }
    } catch (profileError) {
      await User.deleteOne({ _id: user._id });
      throw profileError;
    }

    res.status(201).json({ message: `Registration successful! Welcome ${name}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── Login ──────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account deactivated" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      role:   user.role,
      userId: user._id,
      name:   user.name,
      email:  user.email,
      message: "Login successful"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Request a time-limited password reset link.
router.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const genericMessage = "If an account exists for that email, a reset link has been sent.";
    const user = await User.findOne({ email });

    if (!user) return res.json({ message: genericMessage });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    if (mailer) {
      await mailer.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "PlaceAI password reset",
        text: `Reset your PlaceAI password using this link (expires in 15 minutes): ${resetUrl}`
      });
    } else {
      console.log(`Password reset link for ${user.email}: ${resetUrl}`);
    }

    return res.json({ message: genericMessage });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to process password reset request" });
  }
});

// Set a new password using a single-use, time-limited token.
router.post("/reset-password/:token", async (req, res) => {
  try {
    const password = String(req.body.password || "");
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Reset link is invalid or expired" });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successful. Please login." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to reset password" });
  }
});

module.exports = router;