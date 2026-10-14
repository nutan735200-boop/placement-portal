import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentAPI } from "../utils/api";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingDriveId, setApplyingDriveId] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.allSettled([
          studentAPI.getProfile(),
          studentAPI.getAvailableDrives(),
          studentAPI.getApplications()
        ]);
        const [profileResponse, drivesResponse, applicationsResponse] = responses;
        if (profileResponse.status === "fulfilled") setProfile(profileResponse.value.data);
        if (drivesResponse.status === "fulfilled") setDrives(drivesResponse.value.data || []);
        if (applicationsResponse.status === "fulfilled") setApplications(applicationsResponse.value.data || []);
        if (responses.some(response => response.status === "rejected")) {
          setError("Some student data could not be loaded. You can still update your profile.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (driveId) => {
    setApplyingDriveId(driveId);
    setApplicationMessage("");
    try {
      const response = await studentAPI.applyToDrive(driveId);
      setApplicationMessage(response.data.message || "Application submitted successfully!");
      const applicationsResponse = await studentAPI.getApplications();
      if (applicationsResponse.data) setApplications(applicationsResponse.data);
    } catch (err) {
      setApplicationMessage(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplyingDriveId(null);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const shortlisted = applications.filter(application =>
    ["shortlisted", "selected"].includes(application.status)
  ).length;

  return (
    <main className="main-content">
      {error && <div className="alert alert-error">{error}</div>}
      <div className="page-title">Welcome back, {profile?.name || "Student"}</div>
      <div className="page-sub">Your placement activity at a glance</div>

      <div className="card">
        <div className="card-title">Complete Your Profile</div>
        <p>{profile?.resumeUrl ? "Your resume is uploaded." : "Upload your resume to apply for placement drives."}</p>
        <Link className="btn btn-primary" to="/student/profile">
          {profile?.resumeUrl ? "View Profile & Resume" : "Open Profile & Upload Resume"}
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">{applications.length}</div><div className="stat-label">Applications</div></div>
        <div className="stat-card green"><div className="stat-num">{shortlisted}</div><div className="stat-label">Shortlisted</div></div>
        <div className="stat-card navy"><div className="stat-num">{drives.filter(drive => drive.eligible).length}</div><div className="stat-label">Eligible Drives</div></div>
        <div className="stat-card"><div className="stat-num">{profile?.skills?.length || 0}</div><div className="stat-label">Profile Skills</div></div>
      </div>

      <div className="card">
        <div className="card-title">Available Drives</div>
        {applicationMessage && <div className="alert alert-info">{applicationMessage}</div>}
        {drives.length === 0 ? <div className="empty-state"><div className="empty-text">No active drives right now</div></div> : <div className="table-wrap">
          <table><thead><tr><th>Company</th><th>Role</th><th>Eligibility</th><th>Action</th></tr></thead><tbody>
            {drives.slice(0, 10).map(drive => <tr key={drive._id}><td>{drive.company}</td><td>{drive.role || drive.title}</td><td><span className={`badge ${drive.eligible ? "badge-green" : "badge-red"}`}>{drive.eligible ? "Eligible" : "Not Eligible"}</span></td><td><button className="btn btn-success" onClick={() => handleApply(drive._id)} disabled={!drive.eligible || applyingDriveId === drive._id}>{applyingDriveId === drive._id ? "Applying..." : "Apply Now"}</button></td></tr>)}
          </tbody></table>
        </div>}
      </div>

      <div className="card">
        <div className="card-title">Recent Applications</div>
        {applications.length === 0 ? <div className="empty-state"><div className="empty-text">No applications yet</div></div> : <div className="table-wrap">
          <table><thead><tr><th>Company</th><th>Role</th><th>Status</th></tr></thead><tbody>
            {applications.slice(0, 10).map(application => <tr key={application._id}><td>{application.driveId?.company || "-"}</td><td>{application.driveId?.role || "-"}</td><td><span className="badge badge-blue">{application.status}</span></td></tr>)}
          </tbody></table>
        </div>}
      </div>
    </main>
  );
}