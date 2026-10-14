const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  company:     { type: String, default: "" },
  designation: { type: String, default: "" },
  phone:       { type: String, default: "" },
  website:     { type: String, default: "" },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recruiter", recruiterSchema);