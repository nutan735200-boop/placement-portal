const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");
const path       = require("path");

dotenv.config();

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/student",   require("./routes/student"));
app.use("/api/recruiter", require("./routes/recruiter"));
app.use("/api/drives",    require("./routes/drives"));
app.use("/api/shortlist", require("./routes/shortlist"));
app.use("/api/analytics", require("./routes/analytics"));

// ── Root ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Campus Placement Portal API — Nutan Kumari",
    version: "1.0.0",
    status:  "running"
  });
});

// ── Connect DB and Start ──────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });