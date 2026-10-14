const express     = require("express");
const Student     = require("../models/student");
const Drive       = require("../models/drive");
const Application = require("../models/application");
const { protect, requireRole } = require("../middleware/auth");
const router      = express.Router();

router.get("/dashboard", protect, requireRole("tpo","recruiter"), async (req, res) => {
  try {
    const totalStudents  = await Student.countDocuments();
    const totalDrives    = await Drive.countDocuments();
    const activeDrives   = await Drive.countDocuments({ status: "active" });
    const totalApps      = await Application.countDocuments();
    const shortlisted    = await Application.countDocuments({ status: "shortlisted" });
    const selected       = await Application.countDocuments({ status: "selected" });

    const branchStats = await Student.aggregate([
      { $group: { _id: "$branch", count: { $sum: 1 } } },
      { $sort:  { count: -1 } }
    ]);

    const companyStats = await Drive.aggregate([
      { $group: { _id: "$company", drives: { $sum: 1 }, applicants: { $sum: "$totalApplicants" } } },
      { $sort:  { applicants: -1 } },
      { $limit: 10 }
    ]);

    const scoreStats = await Application.aggregate([
      { $match: { aiScore: { $ne: null } } },
      { $group: {
        _id: null,
        avg: { $avg: "$aiScore" },
        max: { $max: "$aiScore" },
        min: { $min: "$aiScore" }
      }}
    ]);

    res.json({
      summary: {
        totalStudents, totalDrives, activeDrives,
        totalApplications: totalApps,
        shortlisted, selected,
        shortlistRate: totalApps ? +((shortlisted/totalApps)*100).toFixed(1) : 0
      },
      branchStats,
      companyStats,
      aiScores: scoreStats[0] || { avg: 0, max: 0, min: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;