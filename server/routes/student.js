const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const pdfParse = require("pdf-parse");
const Student  = require("../models/student");
const Drive    = require("../models/drive");
const Application = require("../models/application");
const { protect, requireRole } = require("../middleware/auth");
const { extractSkills, extractCGPA, extractBranch, preprocessText } = require("../algorithm/MSCEA");
const router   = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/resumes";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.userId}_resume${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ── Get Profile ────────────────────────────────────────────
router.get("/profile", protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ message: "Profile not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update Profile ─────────────────────────────────────────
router.put("/profile", protect, requireRole("student"), async (req, res) => {
  try {
    const updates = req.body;
    delete updates.userId; delete updates.email;

    const student = await Student.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true }
    );
    res.json({ message: "Profile updated", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Upload Resume ──────────────────────────────────────────
router.post("/resume", protect, requireRole("student"), upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData   = await pdfParse(pdfBuffer);
    const rawText   = pdfData.text;

    if (!rawText || rawText.length < 50)
      return res.status(400).json({ message: "Could not extract text from PDF. Use a text-based PDF." });

    // Extract using our custom algorithm
    const skills     = extractSkills(rawText);
    const cgpa       = extractCGPA(rawText);
    const branch     = extractBranch(rawText);
    const processed  = preprocessText(rawText).join(" ");

    const updates = {
      resumeUrl:  `/uploads/resumes/${req.file.filename}`,
      resumeText: rawText,
      resumeProcessed: processed,
    };
    if (skills.length)  updates.skills = skills;
    if (cgpa !== null)  updates.cgpa   = cgpa;
    if (branch)         updates.branch = branch;

    await Student.findOneAndUpdate({ userId: req.user.userId }, { $set: updates });

    res.json({
      message:  `Resume uploaded! Found ${skills.length} skills. CGPA: ${cgpa || "not found"}. Branch: ${branch || "not found"}.`,
      skills, cgpa, branch
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Available Drives ───────────────────────────────────
router.get("/drives", protect, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    const drives  = await Drive.find({ status: "active" });

    const result = drives.map(d => ({
      ...d._doc,
      eligible: (student.cgpa || 0) >= d.minCgpa
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Apply for Drive ────────────────────────────────────────
router.post("/apply/:driveId", protect, requireRole("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) return res.status(404).json({ message: "Profile not found" });

    if (!student.resumeUrl)
      return res.status(400).json({ message: "Please upload resume first" });

    const drive = await Drive.findById(req.params.driveId);
    if (!drive)    return res.status(404).json({ message: "Drive not found" });
    if (drive.status !== "active") return res.status(400).json({ message: "Drive is not active" });

    if ((student.cgpa || 0) < drive.minCgpa)
      return res.status(403).json({ message: `CGPA ${student.cgpa} < required ${drive.minCgpa}` });

    const existing = await Application.findOne({ studentId: req.user.userId, driveId: drive._id });
    if (existing) return res.status(400).json({ message: "Already applied" });

    await Application.create({ studentId: req.user.userId, driveId: drive._id });
    await Drive.findByIdAndUpdate(drive._id, { $inc: { totalApplicants: 1 } });

    res.json({ message: `Applied for ${drive.title} at ${drive.company}!` });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── My Applications ────────────────────────────────────────
router.get("/applications", protect, requireRole("student"), async (req, res) => {
  try {
    const apps = await Application.find({ studentId: req.user.userId }).populate("driveId");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;