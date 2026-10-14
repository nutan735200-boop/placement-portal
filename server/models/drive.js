const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema({
  recruiterId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:            { type: String, required: true },
  company:          { type: String, required: true },
  role:             { type: String, required: true },
  description:      { type: String, default: "" },
  packageLpa:       { type: Number, default: 0 },
  location:         { type: String, default: "" },
  requiredSkills:   [{ type: String }],
  preferredSkills:  [{ type: String }],
  minCgpa:          { type: Number, default: 6.0 },
  allowedBranches:  [{ type: String }],
  maxBacklogs:      { type: Number, default: 0 },
  graduationYears:  [{ type: Number }],
  deadline:         { type: Date },
  driveDate:        { type: Date },
  threshold:        { type: Number, default: 60 },
  status:           { type: String, enum: ["upcoming","active","closed"], default: "upcoming" },
  totalApplicants:  { type: Number, default: 0 },
  createdAt:        { type: Date, default: Date.now }
});

module.exports = mongoose.model("Drive", driveSchema);