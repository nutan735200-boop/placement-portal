const express     = require("express");
const Drive       = require("../models/drive");
const Student     = require("../models/student");
const Application = require("../models/application");
const { protect, requireRole } = require("../middleware/auth");
const { runMSCEA } = require("../algorithm/MSCEA");
const router      = express.Router();

// ── Run MSCEA Shortlisting ─────────────────────────────────
router.post("/run", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    const { driveId, threshold } = req.body;

    const drive = await Drive.findById(driveId);
    if (!drive) return res.status(404).json({ message: "Drive not found" });

    if (req.user.role === "recruiter" &&
        drive.recruiterId.toString() !== req.user.userId)
      return res.status(403).json({ message: "Not your drive" });

    // Get all applicants
    const apps = await Application.find({ driveId });
    if (!apps.length) return res.status(404).json({ message: "No applicants found" });

    // Get student profiles
    const students = [];
    for (const app of apps) {
      const s = await Student.findOne({ userId: app.studentId });
      if (s) students.push({ ...s._doc, _id: app.studentId });
    }

    const cutoff = threshold || drive.threshold || 60;

    // 🤖 Run MSCEA
    const result = runMSCEA(students, drive._doc, cutoff);

    // Update application statuses in DB
    for (const c of result.allCandidates) {
      const status = c.shortlisted ? "shortlisted" : (c.eliminatedAt ? "rejected" : "rejected");
      await Application.findOneAndUpdate(
        { studentId: c.studentId, driveId },
        {
          $set: {
            status,
            aiScore:      c.aiScore      || null,
            skillScore:   c.skillScore   || null,
            cgpaScore:    c.cgpaScore    || null,
            textScore:    c.textScore    || null,
            eligScore:    c.eligScore    || null,
            matchedSkills: c.matchedSkills || [],
            missingSkills: c.missingSkills || [],
            partialSkills: c.partialSkills || [],
            reasons:      c.reasons       || [],
            aiRunAt:      new Date()
          }
        }
      );
    }

    res.json({
      message:    "AI Shortlisting completed!",
      summary:    result.summary,
      shortlisted: result.shortlisted,
      eliminated:  result.eliminated
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ── Get Shortlist Results ──────────────────────────────────
router.get("/:driveId", protect, async (req, res) => {
  try {
    const apps = await Application.find({ driveId: req.params.driveId })
      .sort({ aiScore: -1 });

    const shortlisted = apps.filter(a => a.status === "shortlisted");
    const others      = apps.filter(a => a.status !== "shortlisted");

    res.json({ shortlisted, others, total: apps.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Manual Override ────────────────────────────────────────
router.put("/update/:driveId/:studentId", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["shortlisted","rejected","selected","on_hold","applied"];
    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    await Application.findOneAndUpdate(
      { driveId: req.params.driveId, studentId: req.params.studentId },
      { $set: { status, manuallyUpdated: true } }
    );

    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;