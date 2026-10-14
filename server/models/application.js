const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driveId:      { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
  status:       { type: String, enum: ["applied","shortlisted","rejected","selected","on_hold"], default: "applied" },
  aiScore:      { type: Number, default: null },
  skillScore:   { type: Number, default: null },
  cgpaScore:    { type: Number, default: null },
  textScore:    { type: Number, default: null },
  eligScore:    { type: Number, default: null },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  partialSkills: [{ type: mongoose.Schema.Types.Mixed }],
  reasons:      [{ type: String }],
  appliedAt:    { type: Date, default: Date.now },
  aiRunAt:      { type: Date, default: null }
});

// Prevent duplicate applications
applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);