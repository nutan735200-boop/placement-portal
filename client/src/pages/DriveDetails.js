import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { drivesAPI, studentAPI } from "../utils/api";

const DriveDetails = () => {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDrive();
  }, [id]);

  const fetchDrive = async () => {
    try {
      const res = await drivesAPI.getById(id);
      setDrive(res.data);
    } catch (err) {
      setError("Failed to fetch drive details");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setError("");
    setSuccess("");
    try {
      await studentAPI.applyToDrive(id);
      setSuccess("Application submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!drive) return <div className="alert alert-danger">Drive not found</div>;

  return (
    <div>
      <h1 className="page-title">{drive.title}</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>{drive.company}</h2>
        </div>

        <div className="grid-2">
          <div>
            <p><strong>Position:</strong> {drive.role}</p>
            <p><strong>Package:</strong> {drive.packageLpa} LPA</p>
            <p><strong>Location:</strong> {drive.location}</p>
            <p><strong>Minimum CGPA:</strong> {drive.minCgpa}</p>
            <p><strong>Max Backlogs:</strong> {drive.maxBacklogs}</p>
            <p><strong>Status:</strong> <span className={`badge badge-${drive.status}`}>{drive.status}</span></p>
          </div>

          <div>
            <p><strong>Application Deadline:</strong> {new Date(drive.deadline).toLocaleDateString()}</p>
            <p><strong>Drive Date:</strong> {new Date(drive.driveDate).toLocaleDateString()}</p>
            <p><strong>Total Applicants:</strong> {drive.totalApplicants}</p>
            <p><strong>Allowed Branches:</strong> {drive.allowedBranches?.join(", ") || "All"}</p>
            <p><strong>Graduation Years:</strong> {drive.graduationYears?.join(", ") || "All"}</p>
          </div>
        </div>

        <div className="divider"></div>

        <h3>Description</h3>
        <p>{drive.description}</p>

        <h3>Required Skills</h3>
        {drive.requiredSkills && drive.requiredSkills.length > 0 ? (
          <div>
            {drive.requiredSkills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p>No specific skills required</p>
        )}

        <h3 style={{ marginTop: "20px" }}>Preferred Skills</h3>
        {drive.preferredSkills && drive.preferredSkills.length > 0 ? (
          <div>
            {drive.preferredSkills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p>No preferred skills</p>
        )}

        <div style={{ marginTop: "30px" }}>
          <button
            onClick={handleApply}
            disabled={applying || drive.status !== "active"}
            className="btn btn-success"
          >
            {applying ? "Applying..." : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriveDetails;
