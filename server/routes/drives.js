const express = require("express");
const Drive   = require("../models/drive");
const Application = require("../models/application");
const Student = require("../models/student");
const { protect, requireRole } = require("../middleware/auth");
const MSCEA = require("../algorithm/MSCEA");
const Metrics = require("../algorithm/MSCEAEvaluation");
const router  = express.Router();

// ── Create Drive ───────────────────────────────────────────
router.post("/", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    const drive = await Drive.create({ ...req.body, recruiterId: req.user.userId });
    res.status(201).json({ message: "Drive created!", drive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get All Drives ─────────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "recruiter") query.recruiterId = req.user.userId;
    else query.status = { $in: ["active","upcoming"] };
    const drives = await Drive.find(query).sort({ createdAt: -1 });
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Single Drive ───────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: "Drive not found" });
    res.json(drive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update Drive Requirements ───────────────────────────────
router.put("/:id", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    console.log("PUT /:id called with ID:", req.params.id);
    console.log("User:", req.user);
    console.log("Body:", req.body);
    
    const { title, role, company, description, packageLpa, location, requiredSkills, minCgpa, maxBacklogs, deadline, driveDate } = req.body;
    
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      console.log("Drive not found for ID:", req.params.id);
      return res.status(404).json({ message: "Drive not found" });
    }
    
    console.log("Found drive:", drive._id, "Recruiter:", drive.recruiterId);
    
    // Check authorization - only the drive creator or TPO can edit
    if (req.user.role === "recruiter" && drive.recruiterId.toString() !== req.user.userId) {
      console.log("Authorization failed. Drive recruiter:", drive.recruiterId, "User ID:", req.user.userId);
      return res.status(403).json({ message: "Not authorized to edit this drive" });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (role !== undefined) updateData.role = role;
    if (company !== undefined) updateData.company = company;
    if (description !== undefined) updateData.description = description;
    if (packageLpa !== undefined) updateData.packageLpa = packageLpa;
    if (location !== undefined) updateData.location = location;
    if (requiredSkills !== undefined) updateData.requiredSkills = requiredSkills;
    if (minCgpa !== undefined) updateData.minCgpa = minCgpa;
    if (maxBacklogs !== undefined) updateData.maxBacklogs = maxBacklogs;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (driveDate !== undefined) updateData.driveDate = driveDate;

    console.log("Update data:", updateData);
    
    const updatedDrive = await Drive.findByIdAndUpdate(
      req.params.id, updateData, { new: true, runValidators: true }
    );
    
    console.log("Updated drive:", updatedDrive);
    
    res.json({ message: "Drive updated successfully", drive: updatedDrive });
  } catch (err) {
    console.error("Error in PUT /:id:", err);
    res.status(500).json({ message: err.message });
  }
});

// ── Update Drive Status ────────────────────────────────────
router.put("/:id/status", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["upcoming","active","closed"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const drive = await Drive.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    
    if (!drive) return res.status(404).json({ message: "Drive not found" });
    
    res.json({ message: `Drive status updated to ${status}`, drive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Drive Applicants ───────────────────────────────────
router.get("/:id/applicants", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    const apps = await Application.find({ driveId: req.params.id });

    const result = await Promise.all(apps.map(async (app) => {
      const student = await Student.findOne({ userId: app.studentId });
      return {
        applicationId: app._id,
        status:        app.status,
        aiScore:       app.aiScore,
        skillScore:    app.skillScore,
        matchedSkills: app.matchedSkills,
        missingSkills: app.missingSkills,
        appliedAt:     app.appliedAt,
        student: student ? {
          name: student.name, email: student.email,
          cgpa: student.cgpa, branch: student.branch,
          skills: student.skills, college: student.college
        } : null
      };
    }));

    result.sort((a,b) => (b.aiScore||0) - (a.aiScore||0));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── MSCEA Ranking (NEW) ────────────────────────────────────
router.post("/:id/rank", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    const { threshold = 60 } = req.body;
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: "Drive not found" });

    const apps = await Application.find({ driveId: req.params.id });
    const applicants = await Promise.all(
      apps.map(async (app) => {
        const student = await Student.findOne({ userId: app.studentId });
        return {
          _id: student._id,
          id: student._id,
          name: student.name,
          email: student.email,
          cgpa: student.cgpa,
          branch: student.branch,
          backlogs: student.backlogs || 0,
          skills: student.skills || [],
          college: student.college,
          resumeText: student.resumeText || ""
        };
      })
    );

    const result = MSCEA.runMSCEA(applicants, {
      minCgpa: drive.minCgpa || 0,
      maxBacklogs: drive.maxBacklogs || 0,
      allowedBranches: drive.allowedBranches || [],
      requiredSkills: drive.requiredSkills || [],
      preferredSkills: drive.preferredSkills || [],
      title: drive.title,
      description: drive.description
    }, threshold);

    // Save results to drive
    drive.msceaResult = result;
    await drive.save();

    res.json({
      message: "MSCEA ranking completed",
      summary: result.summary,
      shortlisted: result.shortlisted.map(c => ({
        studentId: c.studentId,
        name: c.name,
        email: c.email,
        score: c.aiScore,
        skillMatch: c.skillScore,
        cgpaScore: c.cgpaScore,
        textMatch: c.textScore
      })),
      total: result.allCandidates.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Student Insights (NEW) ─────────────────────────────
router.get("/:driveId/candidates/:studentId/insights", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    const drive = await Drive.findById(req.params.driveId);

    if (!student || !drive)
      return res.status(404).json({ message: "Student or drive not found" });

    const insights = MSCEA.generateStudentInsights(student, {
      minCgpa: drive.minCgpa || 0,
      requiredSkills: drive.requiredSkills || [],
      title: drive.title,
      description: drive.description
    });

    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Candidate Compatibility (NEW) ──────────────────────
router.get("/:driveId/candidates/:studentId/compatibility", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    const drive = await Drive.findById(req.params.driveId);

    if (!student || !drive)
      return res.status(404).json({ message: "Student or drive not found" });

    const compat = MSCEA.generateCompatibilityMatrix(student, {
      minCgpa: drive.minCgpa || 0,
      requiredSkills: drive.requiredSkills || [],
      title: drive.title,
      description: drive.description
    });

    res.json(compat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Skill Impact Prediction (NEW) ──────────────────────
router.get("/:driveId/candidates/:studentId/skill-impact", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    const drive = await Drive.findById(req.params.driveId);

    if (!student || !drive)
      return res.status(404).json({ message: "Student or drive not found" });

    const impact = MSCEA.predictSkillImpact(
      student.skills || [],
      drive.requiredSkills || []
    );

    res.json(impact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Drive Evaluation Metrics (NEW) ──────────────────────
router.get("/:id/metrics", protect, requireRole("recruiter","tpo"), async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: "Drive not found" });
    if (!drive.msceaResult) return res.status(400).json({ message: "MSCEA not run yet. Call POST /:id/rank first" });

    const report = Metrics.generateEvaluationReport(drive.msceaResult, {});
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;