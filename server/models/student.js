const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    default: ""
  },

  college: {
    type: String,
    default: ""
  },

  degree: {
    type: String,
    default: "MCA"
  },

  branch: {
    type: String,
    default: ""
  },

  cgpa: {
    type: Number,
    default: 0
  },

  graduationYear: {
    type: Number,
    default: 2026
  },

  backlogs: {
    type: Number,
    default: 0
  },

  skills: [{ type: String }],
  projects: [{ type: String }],
  certifications: [{ type: String }],

  linkedin: {
    type: String,
    default: ""
  },

  github: {
    type: String,
    default: ""
  },

  resumeUrl: {
    type: String,
    default: ""
  },

  resumeText: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Student", studentSchema);