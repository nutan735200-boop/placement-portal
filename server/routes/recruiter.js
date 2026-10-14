const express   = require("express");
const Recruiter = require("../models/recruiter");
const { protect, requireRole } = require("../middleware/auth");
const router    = express.Router();

router.get("/profile", protect, requireRole("recruiter"), async (req, res) => {
  try {
    const r = await Recruiter.findOne({ userId: req.user.userId });
    if (!r) return res.status(404).json({ message: "Profile not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile", protect, requireRole("recruiter"), async (req, res) => {
  try {
    const updates = req.body;
    delete updates.userId; delete updates.email;
    const r = await Recruiter.findOneAndUpdate(
      { userId: req.user.userId }, { $set: updates }, { new: true }
    );
    res.json({ message: "Profile updated", recruiter: r });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;