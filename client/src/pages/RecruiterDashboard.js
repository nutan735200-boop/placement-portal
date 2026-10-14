import React, { useEffect, useState } from "react";
import axios from "axios";

const TABS = ["Dashboard", "Create Drive", "My Drives", "Shortlisting"];

export default function RecruiterDashboard() {
  const [tab, setTab] = useState("Dashboard");
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [shortlistResult, setShortlistResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [threshold, setThreshold] = useState(60);
  const [form, setForm] = useState({ title: "", company: "", role: "", description: "", packageLpa: "", location: "", requiredSkills: "", preferredSkills: "", minCgpa: 6, maxBacklogs: 0, allowedBranches: "", graduationYears: "2026", deadline: "", driveDate: "", threshold: 60 });

  useEffect(() => { loadDrives(); }, []);

  const loadDrives = async () => {
    setLoading(true);
    try { setDrives((await axios.get("/api/drives")).data || []); }
    catch (err) { setError(err.response?.data?.message || "Error loading drives"); }
    finally { setLoading(false); }
  };

  const updateForm = (field, value) => setForm({ ...form, [field]: value });
  const listValue = value => value.split(",").map(item => item.trim()).filter(Boolean);

  const createDrive = async event => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      await axios.post("/api/drives", { ...form, packageLpa: parseFloat(form.packageLpa) || 0, minCgpa: parseFloat(form.minCgpa) || 6, maxBacklogs: parseInt(form.maxBacklogs) || 0, threshold: parseFloat(form.threshold) || 60, requiredSkills: listValue(form.requiredSkills), preferredSkills: listValue(form.preferredSkills), allowedBranches: listValue(form.allowedBranches), graduationYears: listValue(form.graduationYears).map(Number) });
      setMessage("Drive created successfully!"); setTab("My Drives"); loadDrives();
    } catch (err) { setError(err.response?.data?.message || "Error creating drive"); }
  };

  const updateStatus = async (driveId, status) => {
    try { await axios.put(`/api/drives/${driveId}/status`, { status }); setMessage(`Drive status updated to ${status}`); loadDrives(); }
    catch (err) { setError(err.response?.data?.message || "Error updating drive"); }
  };

  const viewApplicants = async drive => {
    setSelectedDrive(drive); setShortlistResult(null); setError("");
    try { setApplicants((await axios.get(`/api/drives/${drive._id}/applicants`)).data || []); setTab("Shortlisting"); }
    catch (err) { setError(err.response?.data?.message || "Error loading applicants"); }
  };

  const runShortlist = async () => {
    if (!selectedDrive) return;
    setLoading(true); setMessage(""); setError("");
    try {
      const result = await axios.post("/api/shortlist/run", { driveId: selectedDrive._id, threshold: parseFloat(threshold) });
      setShortlistResult(result.data); setMessage("AI shortlisting complete!"); viewApplicants(selectedDrive);
    } catch (err) { setError(err.response?.data?.message || "Error running shortlist"); }
    finally { setLoading(false); }
  };

  const badge = status => <span className={`badge badge-${status === "shortlisted" || status === "selected" ? "green" : status === "rejected" ? "red" : "blue"}`}>{status}</span>;
  const field = (name, label, type = "text") => <div className="form-group"><label className="form-label">{label}</label><input className="form-input" type={type} value={form[name]} onChange={event => updateForm(name, event.target.value)} /></div>;

  return <div className="page-layout"><div className="sidebar">{TABS.map(item => <div key={item} className={`sidebar-item ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>{item === "Dashboard" ? "🏠" : item === "Create Drive" ? "➕" : item === "My Drives" ? "💼" : "🤖"} {item}</div>)}</div><main className="main-content">
    {message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-error">{error}</div>}
    {tab === "Dashboard" && <><div className="page-title">Recruiter Dashboard</div><div className="page-sub">Manage your placement drives and shortlisting</div><div className="stats-grid"><div className="stat-card"><div className="stat-num">{drives.length}</div><div className="stat-label">Total Drives</div></div><div className="stat-card green"><div className="stat-num">{drives.filter(drive => drive.status === "active").length}</div><div className="stat-label">Active Drives</div></div><div className="stat-card navy"><div className="stat-num">{drives.reduce((sum, drive) => sum + (drive.totalApplicants || 0), 0)}</div><div className="stat-label">Total Applicants</div></div></div><div className="card"><div className="card-title">Recent Drives</div>{drives.length === 0 ? <div className="empty-state">No drives yet</div> : <div className="table-wrap"><table><thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Applicants</th><th>Actions</th></tr></thead><tbody>{drives.slice(0, 5).map(drive => <tr key={drive._id}><td>{drive.title}</td><td>{drive.company}</td><td>{badge(drive.status)}</td><td>{drive.totalApplicants || 0}</td><td><button className="btn btn-primary btn-sm" onClick={() => viewApplicants(drive)}>View & Shortlist</button></td></tr>)}</tbody></table></div>}</div></>}
    {tab === "Create Drive" && <div className="card"><div className="card-title">Create New Placement Drive</div><form onSubmit={createDrive}><div className="form-grid">{field("title", "Drive Title")}{field("company", "Company Name")}{field("role", "Role")}{field("packageLpa", "Package (LPA)", "number")}{field("location", "Location")}{field("minCgpa", "Min CGPA", "number")}{field("maxBacklogs", "Max Backlogs", "number")}{field("threshold", "AI Threshold (%)", "number")}{field("deadline", "Application Deadline", "date")}{field("driveDate", "Drive Date", "date")}</div><div className="form-group"><label className="form-label">Job Description</label><textarea className="form-textarea" value={form.description} onChange={event => updateForm("description", event.target.value)} /></div>{field("requiredSkills", "Required Skills (comma separated)")}{field("preferredSkills", "Preferred Skills (comma separated)")}{field("allowedBranches", "Allowed Branches (comma separated)")}{field("graduationYears", "Graduation Years (comma separated)")}<button className="btn btn-primary" type="submit">Create Drive</button></form></div>}
    {tab === "My Drives" && <><div className="page-title">My Drives</div>{loading && <div className="spinner" />}{drives.map(drive => <div className="card" key={drive._id}><div className="card-title">{drive.title}</div><p>{drive.company} | {drive.totalApplicants || 0} applicants | Min CGPA: {drive.minCgpa}</p><div className="skill-tags">{drive.requiredSkills?.map(skill => <span className="skill-tag" key={skill}>{skill}</span>)}</div><button className="btn btn-primary btn-sm" onClick={() => viewApplicants(drive)}>View Applicants & Run AI</button>{drive.status === "active" && <button className="btn btn-danger btn-sm" onClick={() => updateStatus(drive._id, "closed")}>Close Drive</button>}</div>)}</>}
    {tab === "Shortlisting" && <><div className="page-title">AI Shortlisting - MSCEA</div>{selectedDrive ? <><div className="page-sub">Drive: <b>{selectedDrive.title}</b> | {applicants.length} applicants</div><div className="card"><div className="card-title">Run MSCEA Algorithm</div><input className="form-input" type="number" min="0" max="100" value={threshold} onChange={event => setThreshold(event.target.value)} /><button className="btn btn-success" onClick={runShortlist} disabled={loading}>Run AI Shortlisting</button>{shortlistResult && <p>Shortlisted: {shortlistResult.summary.shortlisted} / {shortlistResult.summary.total}</p>}</div><div className="card"><div className="card-title">Applicants</div><div className="table-wrap"><table><thead><tr><th>Name</th><th>CGPA</th><th>AI Score</th><th>Status</th></tr></thead><tbody>{applicants.map(applicant => <tr key={applicant.applicationId}><td>{applicant.student?.name}</td><td>{applicant.student?.cgpa || "-"}</td><td>{applicant.aiScore != null ? `${applicant.aiScore}%` : "-"}</td><td>{badge(applicant.status)}</td></tr>)}</tbody></table></div></div></> : <div className="empty-state">Select a drive to run shortlisting</div>}</>}
  </main></div>;
}